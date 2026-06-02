import { Request, Response } from "express";
import * as recommendedLessonService from "../services/recommendedLessonService";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createRecommendedLessons = async (
  req: AuthRequest,
  res: Response,
) => {
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

    const recommendedLessons =
      await recommendedLessonService.generateRecommendedLessonsForDate(
        userId,
        String(dateParam),
      );

    return res.status(200).json({ success: true, data: recommendedLessons });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to generate recommended lessons",
      detail: error.message,
    });
  }
};

export const getRecommendedLessons = async (
  req: AuthRequest,
  res: Response,
) => {
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

    const recommendedLessons =
      await recommendedLessonService.getRecommendedLessonsForDate(
        userId,
        String(dateParam),
      );

    if (!recommendedLessons) {
      return res.status(404).json({
        success: false,
        message: "Recommended lessons not found for this date",
      });
    }

    return res.status(200).json({ success: true, data: recommendedLessons });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch recommended lessons",
      detail: error.message,
    });
  }
};
