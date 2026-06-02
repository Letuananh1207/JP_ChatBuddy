// src/models/MessageDay.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessageLog {
  content: string;
}

export interface IGrammarSummary {
  grammarName: string;
  count: number;
  logs: {
    wrong: string;
    corrected: string;
  }[];
}

export interface IMessageDay extends Document {
  userId: Types.ObjectId | string;
  dateVN: string;
  messages: IMessageLog[];
}

const MessageDaySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dateVN: { type: String, required: true },
  messages: [
    {
      content: { type: String, required: true },
    },
  ],
});

MessageDaySchema.index({ userId: 1, dateVN: 1 }, { unique: true });

export default mongoose.model<IMessageDay>("MessageDay", MessageDaySchema);
