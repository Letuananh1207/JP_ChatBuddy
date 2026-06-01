// src/services/messageDayService.ts
import MessageDay from "../models/messageDayModel";
import { Types } from "mongoose";
import { groq, GROQ_MODEL } from "../config/groq";
import { IGrammarSummary } from "../models/messageDayModel";
import { grammarErrorLogPrompt } from "../utils/prompts";

export const appendMessage = async (
  userId: string,
  content: string,
  isAnalyzed = false,
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize về đầu ngày

  let doc = await MessageDay.findOne({
    userId: new Types.ObjectId(userId),
    date: today,
  });

  if (!doc) {
    doc = new MessageDay({
      userId,
      date: today,
      messages: [{ content, isAnalyzed }],
    });
  } else {
    doc.messages.push({ content, isAnalyzed });
  }

  await doc.save();
  return doc;
};

export const analyzeAndUpdateSummary = async (userId: string, date: string) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const doc = await MessageDay.findOne({ userId, date: targetDate });
  if (!doc) throw new Error("No messages found for this date");

  const unAnalyzed = doc.messages.filter((m) => !m.isAnalyzed);
  if (unAnalyzed.length === 0) return doc;

  // gọi AI
  const grammarResults = await analyzeGrammar(unAnalyzed.map((m) => m.content));

  // append vào summary
  doc.summary.push(...grammarResults);

  // đánh dấu các message đã phân tích
  doc.messages.forEach((m) => {
    if (!m.isAnalyzed) m.isAnalyzed = true;
  });

  await doc.save();
  return doc;
};

export async function analyzeGrammar(
  userContents: string[],
): Promise<IGrammarSummary[]> {
  try {
    const prompt = grammarErrorLogPrompt(userContents);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Japanese grammar analyzer. Return only JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";
    const match = responseText.match(/\[[\s\S]*\]/);
    const grammarResults: IGrammarSummary[] = match ? JSON.parse(match[0]) : [];

    return grammarResults;
  } catch (error: any) {
    console.error("❌ Groq Grammar Analyze Error:", error.message);
    return [];
  }
}
