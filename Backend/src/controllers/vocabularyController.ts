import { Request, Response } from "express";
import * as vocabularyService from "../services/vocabularyService";

interface AuthRequest extends Request {
  user?: { id: string };
}

// Hàm hiện tại của bạn
export const addWord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { word, meaning, date } = req.body;
    if (!word || !meaning) {
      return res.status(400).json({ message: "Word and meaning are required" });
    }
    const result = await vocabularyService.createVocabulary(
      {
        word,
        meaning,
        date,
      },
      userId,
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error adding vocabulary", error });
  }
};

// Hàm mới: Lấy danh sách
export const getWords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const vocabularies = await vocabularyService.getAllVocabularies(userId);
    res.status(200).json(vocabularies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vocabularies", error });
  }
};

export const removeWord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const deletedWord = await vocabularyService.deleteVocabulary(id, userId);

    if (!deletedWord) {
      return res.status(404).json({ message: "Không tìm thấy từ vựng để xóa" });
    }

    res.status(200).json({ message: "Xóa thành công", id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa từ vựng", error });
  }
};
