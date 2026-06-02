import { Request, Response } from "express";
import * as reviewService from "../services/reviewService";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const dateParam = req.params.date;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!dateParam) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const review = await reviewService.generateReviewForDate(
      userId,
      String(dateParam),
    );

    return res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    console.error("[DEBUG] Create Review Error:", error.message);
    return res.status(500).json({
      error: "Failed to generate review",
      detail: error.message,
    });
  }
};

export const getReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const dateParam = req.params.date;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!dateParam) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const review = await reviewService.getReviewForDate(
      userId,
      String(dateParam),
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found for this date",
      });
    }

    return res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    console.error("[DEBUG] Get Review Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch review",
      detail: error.message,
    });
  }
};
