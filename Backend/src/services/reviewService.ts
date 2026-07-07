import { Types } from "mongoose";
import Review, { IReviewItem } from "../models/reviewModel";
import MessageDay from "../models/messageDayModel";
import { groq, GROQ_MODEL } from "../config/groq";
import { reviewPrompt } from "../utils/prompts";

function extractJsonObject(text: string): any {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const candidates = [
    trimmed,
    trimmed.match(/\{[\s\S]*\}/)?.[0],
    trimmed.match(/```json\s*([\s\S]*?)```/)?.[1],
    trimmed.match(/```\s*([\s\S]*?)```/)?.[1],
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try to repair common issues
      const repaired = candidate
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
      try {
        return JSON.parse(repaired);
      } catch {
        continue;
      }
    }
  }

  return null;
}
import {
  getVietnamDateKey,
  parseVietnamDate,
  parseVietnamDateKey,
} from "../utils/vietnamTime";

interface IReviewAnalysisResult {
  reviews: IReviewItem[];
  summary: string[];
}

export async function generateReviewForDate(
  userId: string,
  date: string,
): Promise<ReturnType<typeof Review.findOneAndUpdate>> {
  const targetDate = parseVietnamDate(date);
  const dateVN = parseVietnamDateKey(date);

  const messageDay = await MessageDay.findOne({
    userId: new Types.ObjectId(userId),
    dateVN,
  });

  if (!messageDay) {
    throw new Error("No messages found for this date");
  }

  if (!messageDay.messages || messageDay.messages.length === 0) {
    throw new Error("No user messages available for this date");
  }

  const analysis = await analyzeReview(
    messageDay.messages.map((message) => message.content),
  );

  const normalizedReviews = analysis.reviews.map((review) => ({
    id: review.id?.trim() || new Types.ObjectId().toHexString(),
    userMessage: review.userMessage,
    correction: review.correction ? review.correction : null,
    improvements: Array.isArray(review.improvements) ? review.improvements : [],
  }));

  const normalizedSummary = Array.isArray(analysis.summary)
    ? analysis.summary.map((item) => String(item))
    : [];

  const updatedReview = await Review.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), dateVN },
    {
      userId,
      date: targetDate,
      dateVN,
      reviews: normalizedReviews,
      summary: normalizedSummary,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return updatedReview;
}

export async function getReviewForDate(userId: string, date: string) {
  const dateVN = parseVietnamDateKey(date);

  const review = await Review.findOne({
    userId: new Types.ObjectId(userId),
    dateVN,
  });

  return review;
}

export async function analyzeReview(
  userContents: string[],
): Promise<IReviewAnalysisResult> {
  try {
    const prompt = reviewPrompt(userContents);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Japanese language teaching assistant. Return only JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 700,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsed: any = extractJsonObject(responseText) || {
      reviews: [],
      summary: [],
    };

    const reviewResults: IReviewItem[] = Array.isArray(parsed.reviews)
      ? parsed.reviews
      : [];
    const summaryResults: string[] = Array.isArray(parsed.summary)
      ? parsed.summary.map((item: any) => String(item))
      : [];

    return {
      reviews: reviewResults.map((item) => ({
        id: item.id?.toString?.() || new Types.ObjectId().toHexString(),
        userMessage: String(item.userMessage || ""),
        correction:
          item.correction === undefined || item.correction === null
            ? null
            : String(item.correction),
        improvements: Array.isArray(item.improvements)
          ? item.improvements.map((improvement) => String(improvement))
          : [],
      })),
      summary: summaryResults,
    };
  } catch (error: any) {
    console.error("❌ Groq Review Analyze Error:", error.message);
    return { reviews: [], summary: [] };
  }
}
