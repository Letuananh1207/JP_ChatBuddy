import { Types } from "mongoose";
import Review, { IReviewItem } from "../models/reviewModel";
import MessageDay from "../models/messageDayModel";
import { groq, GROQ_MODEL } from "../config/groq";
import { reviewPrompt } from "../utils/prompts";
import {
  getVietnamDateKey,
  parseVietnamDate,
  parseVietnamDateKey,
} from "../utils/vietnamTime";

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

  const reviews = await analyzeReview(
    messageDay.messages.map((message) => message.content),
  );

  const normalizedReviews = reviews.map((review, index) => ({
    id: review.id?.trim() || new Types.ObjectId().toHexString(),
    userMessage: review.userMessage,
    correction: review.correction ? review.correction : null,
    improvements: Array.isArray(review.improvements) ? review.improvements : [],
  }));

  const updatedReview = await Review.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), dateVN },
    {
      userId,
      date: targetDate,
      dateVN,
      reviews: normalizedReviews,
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
): Promise<IReviewItem[]> {
  try {
    const prompt = reviewPrompt(userContents);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Japanese language teaching assistant. Return only JSON arrays.",
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

    const responseText = completion.choices[0]?.message?.content || "[]";
    const match = responseText.match(/\[[\s\S]*\]/);
    const reviewResults: IReviewItem[] = match ? JSON.parse(match[0]) : [];

    return reviewResults.map((item) => ({
      id: item.id?.toString?.() || new Types.ObjectId().toHexString(),
      userMessage: String(item.userMessage || ""),
      correction:
        item.correction === undefined || item.correction === null
          ? null
          : String(item.correction),
      improvements: Array.isArray(item.improvements)
        ? item.improvements.map((improvement) => String(improvement))
        : [],
    }));
  } catch (error: any) {
    console.error("❌ Groq Review Analyze Error:", error.message);
    return [];
  }
}
