import Vocabulary, { IVocabulary } from "../models/vocabularyModel";

export const createVocabulary = async (data: Partial<IVocabulary>) => {
  const newWord = new Vocabulary(data);
  return await newWord.save();
};

// Hàm mới: Lấy danh sách từ vựng
export const getAllVocabularies = async () => {
  return await Vocabulary.find().sort({ date: -1 });
};

export const deleteVocabulary = async (id: string) => {
  return await Vocabulary.findByIdAndDelete(id);
};
