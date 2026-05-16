import mongoose, { Schema, Document } from "mongoose";

export interface IVocabulary extends Document {
  word: string;
  meaning: string;
  date: Date;
}

const VocabularySchema: Schema = new Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);
