import express from "express";
import * as chatController from "../controllers/chatController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/send", chatController.postMessage);
router.get("/history", chatController.fetchHistory);

export default router;
