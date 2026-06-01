// src/models/MessageDay.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessageLog {
  content: string;
  isAnalyzed: boolean;
}

export interface IGrammarLog {
  wrong: string; // vùng sai
  corrected: string; // vùng đúng sau sửa
}

export interface IGrammarSummary {
  grammarName: string; // tên cấu trúc ngữ pháp
  count: number; // số lần lỗi xuất hiện
  logs: IGrammarLog[]; // chi tiết từng lỗi
}

export interface IMessageDay extends Document {
  userId: Types.ObjectId | string;
  date: Date;
  messages: IMessageLog[];
  summary: IGrammarSummary[];
}

const GrammarLogSchema = new Schema<IGrammarLog>({
  wrong: { type: String, required: true },
  corrected: { type: String, required: true },
});

const GrammarSummarySchema = new Schema<IGrammarSummary>({
  grammarName: { type: String, required: true },
  count: { type: Number, required: true },
  logs: [GrammarLogSchema],
});

const MessageDaySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  messages: [
    {
      content: { type: String, required: true },
      isAnalyzed: { type: Boolean, default: false },
    },
  ],
  summary: [GrammarSummarySchema],
});

MessageDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IMessageDay>("MessageDay", MessageDaySchema);
