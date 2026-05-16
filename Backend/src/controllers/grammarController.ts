// src/controllers/grammarController.ts
import { Request, Response } from "express";
import Conversation from "../models/chatModel";
import { checkGrammarService } from "../services/grammarService";

export async function checkGrammar(req: Request, res: Response) {
  try {
    const { missions } = req.body; // Frontend gửi lên mảng 5 nhiệm vụ

    if (!missions || !Array.isArray(missions)) {
      return res.status(400).json({ error: "Missions array is required" });
    }

    // 1. Xác định mốc 8h sáng hôm nay
    const today8AM = new Date();
    today8AM.setHours(8, 0, 0, 0);

    // Tìm hội thoại có cập nhật sau 8h sáng
    const conversation = await Conversation.findOne({
      updatedAt: { $gte: today8AM },
    });

    if (!conversation) {
      return res.json({
        missions,
        message: "Không có dữ liệu chat mới từ 8h sáng.",
      });
    }

    // 2. Lọc tin nhắn của 'user' và CHỈ lấy những tin nhắn gửi sau 8h sáng
    const userContents = conversation.messages
      .filter(
        (m: any) => m.role === "user" && new Date(m.timestamp) >= today8AM,
      )
      .map((m: any) => m.content);

    if (userContents.length === 0) {
      return res.json({
        missions,
        message: "Bạn chưa gửi tin nhắn nào sau 8h sáng để kiểm tra.",
      });
    }

    // 3. Gọi AI để so khớp ngữ pháp
    const updatedMissions = await checkGrammarService(userContents, missions);

    // 4. Logic so sánh để đưa ra chú thích
    // Kiểm tra xem số lượng nhiệm vụ hoàn thành (status: true) có tăng lên không
    const oldCompleteCount = missions.filter((m) => m.status).length;
    const newCompleteCount = updatedMissions.filter((m) => m.status).length;

    let note = "Nội dung không có gì thay đổi";
    if (newCompleteCount > oldCompleteCount) {
      note = `Đã cập nhật: Bạn đã hoàn thành thêm ${
        newCompleteCount - oldCompleteCount
      } ngữ pháp mới!`;
    }

    // 5. Trả về kết quả
    res.json({
      missions: updatedMissions,
      message: note,
    });
    console.log({
      missions: updatedMissions,
      message: note,
    });
  } catch (err: any) {
    console.error("Check Grammar Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
