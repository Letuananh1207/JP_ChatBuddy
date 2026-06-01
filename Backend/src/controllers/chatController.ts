// src/controllers/chatController.ts
import { Request, Response } from "express";
import * as chatService from "../services/chatService";
import * as messageDayService from "../services/messageDayService";
interface AuthRequest extends Request {
  user?: { id: string };
}

export const postMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message, quote } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const newConversation = Boolean(req.body.newConversation);
    const result = await chatService.chatWithAI(
      conversationId,
      message,
      quote,
      userId,
      newConversation,
    );

    // Ghi log vào MessageDay
    await messageDayService.appendMessage(userId, message, false);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[DEBUG] Chat Error Details:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      detail: error.message,
      type: error.constructor.name,
    });
  }
};

export const fetchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const conversationId = (req.query.conversationId as string) || null;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const history = await chatService.getHistory(limit, userId, conversationId);

    res.status(200).json(history);
  } catch (error: any) {
    console.error("[DEBUG] Fetch History Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch history",
      detail: error.message,
    });
  }
};

export const fetchConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conversations = await chatService.getConversations(userId, limit);
    res.status(200).json(conversations);
  } catch (error: any) {
    console.error("[DEBUG] Fetch Conversations Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch conversations",
      detail: error.message,
    });
  }
};
