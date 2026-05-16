import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVocabulary extends Document {
  user: Types.ObjectId | string;
  word: string;
  meaning: string;
  date: Date;
}

const VocabularySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);
