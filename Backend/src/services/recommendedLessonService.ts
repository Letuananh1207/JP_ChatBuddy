import { Types } from "mongoose";
import Review from "../models/reviewModel";
import RecommendedLesson from "../models/recommendedLessonModel";
import { groq, GROQ_MODEL } from "../config/groq";
import {
  recommendedLessonPrompt,
  recommendedLessonKeywordPrompt,
} from "../utils/prompts";
import { parseVietnamDate, parseVietnamDateKey } from "../utils/vietnamTime";

interface IRecommendedLessonResult {
  links: string[];
}

export async function generateRecommendedLessonsForDate(
  userId: string,
  date: string,
): Promise<ReturnType<typeof RecommendedLesson.findOneAndUpdate>> {
  const targetDate = parseVietnamDate(date);
  const dateVN = parseVietnamDateKey(date);

  const review = await Review.findOne({
    userId: new Types.ObjectId(userId),
    dateVN,
  });

  if (!review) {
    throw new Error("No review found for this date");
  }

  if (!Array.isArray(review.summary) || review.summary.length === 0) {
    throw new Error("No summary available to generate recommended lessons");
  }

  const links = await analyzeRecommendedLessons(review.summary);
  const normalizedLinks = Array.isArray(links)
    ? links.map((link) => String(link).trim()).filter((link) => link.length > 0)
    : [];

  const updatedLesson = await RecommendedLesson.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), dateVN },
    {
      id: new Types.ObjectId().toHexString(),
      userId,
      dateVN,
      links: normalizedLinks,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return updatedLesson;
}

export async function getRecommendedLessonsForDate(
  userId: string,
  date: string,
) {
  const dateVN = parseVietnamDateKey(date);

  const recommendedLessons = await RecommendedLesson.findOne({
    userId: new Types.ObjectId(userId),
    dateVN,
  });

  return recommendedLessons;
}

export async function analyzeRecommendedLessons(
  summary: string[],
): Promise<string[]> {
  try {
    // Step 1: Ask LLM to generate concise search keywords based on summary
    const keywordPrompt = recommendedLessonKeywordPrompt(summary);
    const keywordCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Japanese lesson recommender. Return only JSON arrays of keywords.",
        },
        {
          role: "user",
          content: keywordPrompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: 300,
    });

    const keywordText = keywordCompletion.choices[0]?.message?.content || "[]";
    const keywordMatch = keywordText.match(/\[[\s\S]*\]/);
    const keywords: string[] = keywordMatch ? JSON.parse(keywordMatch[0]) : [];

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return [];
    }

    // Step 2: For each keyword, query YouTube Data API to get video links
    const { YOUTUBE_API_KEY } = await import("../config/env");
    const https = await import("node:https");

    const collected = new Set<string>();

    const fetchForKeyword = (keyword: string, maxResults = 3) => {
      return new Promise<string[]>((resolve) => {
        try {
          const q = encodeURIComponent(keyword);
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${q}&key=${YOUTUBE_API_KEY}`;
          const req = https.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                const items = Array.isArray(parsed.items) ? parsed.items : [];
                const links = items
                  .map((it: any) =>
                    it.id && it.id.videoId
                      ? `https://www.youtube.com/watch?v=${it.id.videoId}`
                      : null,
                  )
                  .filter(Boolean) as string[];
                resolve(links);
              } catch (e) {
                resolve([]);
              }
            });
          });
          req.on("error", () => resolve([]));
        } catch (e) {
          resolve([]);
        }
      });
    };

    for (const kw of keywords) {
      if (collected.size >= 5) break; // stop when we have enough
      const links = await fetchForKeyword(kw, 3);
      for (const l of links) {
        if (collected.size >= 5) break;
        collected.add(l);
      }
    }

    return Array.from(collected);
  } catch (error: any) {
    console.error("❌ Groq Recommended Lessons Error:", error.message);
    return [];
  }
}
