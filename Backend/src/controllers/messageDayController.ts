// src/controllers/messageDayController.ts
import { Request, Response } from "express";
import * as messageDayService from "../services/messageDayService";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const updateSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const dateParam = req.params.date; // có thể undefined

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!dateParam) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    // đảm bảo dateParam là string
    const doc = await messageDayService.analyzeAndUpdateSummary(
      userId,
      String(dateParam),
    );

    res.status(200).json(doc);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update summary",
      detail: error.message,
    });
  }
};
