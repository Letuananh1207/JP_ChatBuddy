import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReviewItem {
  id: string;
  userMessage: string;
  correction?: string | null;
  improvements: string[];
}

export interface IReview extends Document {
  userId: Types.ObjectId | string;
  date: Date;
  dateVN: string;
  reviews: IReviewItem[];
  summary: string[];
}

const ReviewItemSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    userMessage: { type: String, required: true },
    correction: { type: String, default: null },
    improvements: [{ type: String, required: true }],
  },
  { _id: false },
);

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    dateVN: { type: String, required: true },
    reviews: { type: [ReviewItemSchema], default: [] },
    summary: { type: [String], default: [] },
  },
  { timestamps: true },
);

ReviewSchema.index({ userId: 1, dateVN: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);
