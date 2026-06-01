// src/services/grammarService.ts
import { groq, GROQ_MODEL } from "../config/groq";

export async function checkGrammarService(
  userContents: string[],
  missions: any[],
) {
  // 1. Chỉ lọc ra những ngữ pháp chưa hoàn thành để tiết kiệm Token và tăng độ chính xác
  const pendingMissions = missions.filter((m) => !m.status);

  if (pendingMissions.length === 0) return missions;

  try {
    // 2. Tạo prompt yêu cầu AI kiểm tra
    const prompt = `
      Bạn là một chuyên gia ngôn ngữ Nhật Bản. 
      Dưới đây là danh sách các câu tin nhắn của người dùng (User Messages) và danh sách cấu trúc ngữ pháp mục tiêu (Target Grammars).
      
      User Messages: ${JSON.stringify(userContents)}
      Target Grammars: ${JSON.stringify(
        pendingMissions.map((m) => ({
          id: m.id,
          name: m.name,
          meaning: m.meaning,
        })),
      )}
      
      Nhiệm vụ:
      1. Kiểm tra xem trong các tin nhắn của người dùng có sử dụng ĐÚNG cách dùng của bất kỳ ngữ pháp mục tiêu nào không.
      2. Chỉ tính là đúng nếu ngữ pháp đó xuất hiện thực tế trong câu của người dùng.
      3. TRẢ VỀ DUY NHẤT một mảng JSON chứa các ID của ngữ pháp đã hoàn thành. 
         Ví dụ: ["JLPT42", "JLPT10"]
      4. Nếu không có ngữ pháp nào đúng, trả về: []
      
      Lưu ý: Không giải thích gì thêm, chỉ trả về mảng JSON.
    `;

    // 3. Gọi Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a Japanese grammar checker. Return only JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0, // Đặt bằng 0 để đảm bảo tính chính xác và nhất quán
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // 4. Trích xuất JSON từ phản hồi của Groq
    const match = responseText.match(/\[.*\]/s);
    const completedIds: string[] = match ? JSON.parse(match[0]) : [];

    // 5. Cập nhật lại mảng missions gốc và trả về
    return missions.map((m) => ({
      ...m,
      status: m.status || completedIds.includes(m.id),
    }));
  } catch (error: any) {
    console.error("❌ Groq Grammar Check Error:", error.message);
    // Nếu lỗi AI, trả về danh sách missions cũ để không làm lỗi ứng dụng
    return missions;
  }
}
