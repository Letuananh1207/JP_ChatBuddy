import Vocabulary, { IVocabulary } from "../models/vocabularyModel";

export const createVocabulary = async (
  data: Pick<IVocabulary, "word" | "meaning" | "date">,
  userId: string,
) => {
  const newWord = new Vocabulary({ ...data, user: userId });
  return await newWord.save();
};

// Hàm mới: Lấy danh sách từ vựng của user
export const getAllVocabularies = async (userId: string) => {
  return await Vocabulary.find({ user: userId }).sort({ date: -1 });
};

export const deleteVocabulary = async (id: string, userId: string) => {
  return await Vocabulary.findOneAndDelete({ _id: id, user: userId });
};
