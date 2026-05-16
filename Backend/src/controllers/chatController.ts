// src/controllers/chatController.ts
import { Request, Response } from "express";
import * as chatService from "../services/chatService";

export const postMessage = async (req: Request, res: Response) => {
  try {
    // CẬP NHẬT: Thêm 'quote' vào danh sách các trường lấy ra từ req.body
    const { conversationId, message, quote } = req.body;

    // Log dữ liệu đầu vào bao gồm cả quote để dễ dàng debug
    console.log(">>> Incoming Request:", { conversationId, message, quote });

    // CẬP NHẬT: Truyền 'quote' vào hàm chatWithAI
    const result = await chatService.chatWithAI(conversationId, message, quote);

    res.status(200).json(result);
  } catch (error: any) {
    // In lỗi ra Terminal của VS Code/Nodejs
    console.error("[DEBUG] Chat Error Details:");
    console.error("- Message:", error.message);
    console.error("- Stack:", error.stack);

    // Trả về lỗi chi tiết cho client (Extension/Postman)
    res.status(500).json({
      error: "Internal Server Error",
      detail: error.message,
      type: error.constructor.name,
    });
  }
};

export const fetchHistory = async (req: Request, res: Response) => {
  try {
    // Lấy limit từ query string (ví dụ: ?limit=50). Nếu không có thì mặc định lấy 20.
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const history = await chatService.getHistory(limit);

    res.status(200).json(history);
  } catch (error: any) {
    console.error("[DEBUG] Fetch History Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch history",
      detail: error.message,
    });
  }
};
