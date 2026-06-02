import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecommendedLesson extends Document {
  id: string;
  userId: Types.ObjectId | string;
  dateVN: string;
  links: string[];
}

const RecommendedLessonSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateVN: { type: String, required: true },
    links: [{ type: String, required: true }],
  },
  { timestamps: true },
);

RecommendedLessonSchema.index({ userId: 1, dateVN: 1 }, { unique: true });

export default mongoose.model<IRecommendedLesson>(
  "RecommendedLesson",
  RecommendedLessonSchema,
);
