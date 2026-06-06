import { Types } from "mongoose";
import Review from "../models/reviewModel";
import RecommendedLesson from "../models/recommendedLessonModel";
import { groq, GROQ_MODEL } from "../config/groq";
import {
  recommendedLessonPrompt,
  recommendedLessonKeywordPrompt,
} from "../utils/prompts";
import { parseVietnamDate, parseVietnamDateKey } from "../utils/vietnamTime";

interface IRecommendedLessonVideo {
  videoId: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
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

  const videos = await analyzeRecommendedLessons(review.summary);
  const normalizedVideos = Array.isArray(videos)
    ? videos
        .filter(
          (video) =>
            video.videoId && video.url && video.thumbnailUrl && video.embedUrl,
        )
        .map((video) => ({
          videoId: String(video.videoId),
          url: String(video.url),
          embedUrl: String(video.embedUrl),
          thumbnailUrl: String(video.thumbnailUrl),
          title: String(video.title),
          description: String(video.description),
          channelTitle: String(video.channelTitle),
          publishedAt: new Date(video.publishedAt),
        }))
    : [];

  const updatedLesson = await RecommendedLesson.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), dateVN },
    {
      id: new Types.ObjectId().toHexString(),
      userId,
      dateVN,
      videos: normalizedVideos,
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
): Promise<IRecommendedLessonVideo[]> {
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

    const collected = new Map<string, IRecommendedLessonVideo>();

    const fetchForKeyword = (keyword: string, maxResults = 3) => {
      return new Promise<IRecommendedLessonVideo[]>((resolve) => {
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
                const videos = items
                  .map((it: any) => {
                    if (!it.id || !it.id.videoId || !it.snippet) {
                      return null;
                    }
                    const videoId = String(it.id.videoId);
                    const snippet = it.snippet;
                    const thumbnailUrl =
                      snippet.thumbnails?.medium?.url ||
                      snippet.thumbnails?.default?.url ||
                      "";
                    return {
                      videoId,
                      url: `https://www.youtube.com/watch?v=${videoId}`,
                      embedUrl: `https://www.youtube.com/embed/${videoId}`,
                      thumbnailUrl,
                      title: String(snippet.title || ""),
                      description: String(snippet.description || ""),
                      channelTitle: String(snippet.channelTitle || ""),
                      publishedAt: String(
                        snippet.publishedAt || new Date().toISOString(),
                      ),
                    };
                  })
                  .filter(Boolean) as IRecommendedLessonVideo[];
                resolve(videos);
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
      const videos = await fetchForKeyword(kw, 3);
      for (const video of videos) {
        if (collected.size >= 5) break;
        collected.set(video.videoId, video);
      }
    }

    return Array.from(collected.values()).slice(0, 5);
  } catch (error: any) {
    console.error("❌ Groq Recommended Lessons Error:", error.message);
    return [];
  }
}
