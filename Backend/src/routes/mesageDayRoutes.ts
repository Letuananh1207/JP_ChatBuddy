// src/routes/messageDayRoutes.ts
import express from "express";
import { updateSummary } from "../controllers/messageDayController";
import { createReview, getReview } from "../controllers/reviewController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.put("/:date/summary", authMiddleware, updateSummary);
router.put("/:date/review", authMiddleware, createReview);
router.get("/:date/review", authMiddleware, getReview);

export default router;
