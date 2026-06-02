// src/services/messageDayService.ts
import MessageDay from "../models/messageDayModel";
import { Types } from "mongoose";
import { groq, GROQ_MODEL } from "../config/groq";
import { IGrammarSummary } from "../models/messageDayModel";
import { grammarErrorLogPrompt } from "../utils/prompts";
import { getVietnamDateKey, parseVietnamDateKey } from "../utils/vietnamTime";

export const appendMessage = async (userId: string, content: string) => {
  const todayVN = getVietnamDateKey();

  let doc = await MessageDay.findOne({
    userId: new Types.ObjectId(userId),
    dateVN: todayVN,
  });

  if (!doc) {
    doc = new MessageDay({
      userId,
      dateVN: todayVN,
      messages: [{ content }],
    });
  } else {
    doc.messages.push({ content });
  }

  await doc.save();
  return doc;
};

export const analyzeAndUpdateSummary = async (
  userId: string,
  date: string,
): Promise<IGrammarSummary[]> => {
  const dateVN = parseVietnamDateKey(date);

  const doc = await MessageDay.findOne({
    userId: new Types.ObjectId(userId),
    dateVN,
  });
  if (!doc) throw new Error("No messages found for this date");

  if (doc.messages.length === 0) return [];

  // gọi AI
  const grammarResults = await analyzeGrammar(
    doc.messages.map((m) => m.content),
  );

  return grammarResults;
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
