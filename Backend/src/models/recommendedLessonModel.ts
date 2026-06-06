import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecommendedLessonVideo {
  videoId: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: Date;
}

export interface IRecommendedLesson extends Document {
  id: string;
  userId: Types.ObjectId | string;
  dateVN: string;
  videos: IRecommendedLessonVideo[];
}

const RecommendedLessonVideoSchema: Schema = new Schema(
  {
    videoId: { type: String, required: true },
    url: { type: String, required: true },
    embedUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    channelTitle: { type: String, required: true },
    publishedAt: { type: Date, required: true },
  },
  { _id: false },
);

const RecommendedLessonSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateVN: { type: String, required: true },
    videos: { type: [RecommendedLessonVideoSchema], default: [] },
  },
  { timestamps: true },
);

RecommendedLessonSchema.index({ userId: 1, dateVN: 1 }, { unique: true });

export default mongoose.model<IRecommendedLesson>(
  "RecommendedLesson",
  RecommendedLessonSchema,
);
