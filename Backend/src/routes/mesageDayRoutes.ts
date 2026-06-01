// src/routes/messageDayRoutes.ts
import express from "express";
import { updateSummary } from "../controllers/messageDayController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.put("/:date/summary", authMiddleware, updateSummary);

export default router;
