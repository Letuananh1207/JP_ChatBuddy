import express from "express";
import * as chatController from "../controllers/chatController";

const router = express.Router();

router.post("/send", chatController.postMessage);
router.get("/history", chatController.fetchHistory);

export default router;
