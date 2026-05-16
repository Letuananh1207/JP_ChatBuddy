import Chat from "../models/chatModel";
import { groq, GROQ_MODEL } from "../config/groq";

export const chatWithAI = async (
  conversationId: string | null,
  userMessage: string,
  quote?: string | null // Thêm tham số quote
) => {
  let conversation;

  // 1. Tìm record hiện có: theo ID hoặc tìm record mới nhất trong DB
  if (conversationId) {
    conversation = await Chat.findById(conversationId);
  } else {
    // Luôn lấy record gần nhất để tiếp tục trò chuyện trong 1 luồng duy nhất
    conversation = await Chat.findOne().sort({ updatedAt: -1 });
  }

  // 2. Nếu không có bất kỳ record nào trong DB, mới tạo cái đầu tiên
  if (!conversation) {
    console.log("--- Creating the first and only conversation record ---");
    conversation = new Chat({ messages: [] });
  }

  try {
    // 3. Chuẩn bị bối cảnh lịch sử (10 tin nhắn gần nhất)
    const history = conversation.messages.slice(-10).map((msg: any) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    // CẢI TIẾN LOGIC: Định dạng cấu trúc rõ ràng để AI không thể lờ đi phần Quote
    const fullUserMessage = quote
      ? `【DỮ LIỆU TRÍCH DẪN】: "${quote}"\n【CÂU HỎI CỦA USER】: ${userMessage}`
      : userMessage;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
        - Name: Konny.
        - Persona: Tiểu quỷ lém lỉnh, lanh chanh, bạn đồng hành luyện tiếng Nhật.
        - Language: 100% TIẾNG NHẬT (Casual/Thân mật).
        
        - Communication Logic:
          1. ĐẶC BIỆT LƯU Ý: Nếu có "DỮ LIỆU TRÍCH DẪN", đây là trọng tâm. Hãy giải thích, dịch hoặc trả lời dựa trên nội dung trích dẫn đó.
          2. Trả lời trực tiếp và súc tích: 1-2 câu. 
          3. Giọng điệu: Nghịch ngợm, dùng các vĩ ngữ tự nhiên (da yo, zo, jan, tteba...).
          4. Hạn chế Emoji: Tối đa 1 cái (😈).
      `,
        },
        ...history,
        {
          role: "user",
          content: fullUserMessage,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.6, // Giảm nhẹ nhiệt độ để AI bớt lan man, tập trung vào dữ liệu đầu vào
      max_tokens: 300, // Tăng thêm để AI có đủ không gian giải thích trích dẫn
    });

    const aiResponse = completion.choices[0]?.message?.content || "";

    // 4. Lưu User message gốc (không kèm quote) để lịch sử chat sạch sẽ
    return await saveAndReturn(conversation, userMessage, aiResponse);
  } catch (error: any) {
    console.error("❌ Groq API Error:", error.message);
    throw new Error(
      error.message.includes("429") ? "Konny bận quậy rồi!" : "Lỗi kết nối AI."
    );
  }
};

async function saveAndReturn(
  conversation: any,
  userMsg: string,
  aiMsg: string
) {
  // Push thêm vào mảng messages hiện có
  conversation.messages.push({
    role: "user",
    content: userMsg,
    timestamp: new Date(),
  });
  conversation.messages.push({
    role: "assistant",
    content: aiMsg,
    timestamp: new Date(),
  });

  conversation.updatedAt = new Date();
  await conversation.save();

  return {
    conversationId: conversation._id,
    reply: aiMsg,
  };
}

/**
 * Lấy lịch sử từ DUY NHẤT một record hội thoại mới nhất
 */
export const getHistory = async (limit: number = 20) => {
  try {
    const conversation = await Chat.findOne().sort({ updatedAt: -1 }).lean();
    if (!conversation || !conversation.messages) return [];

    const lastMessages = conversation.messages.slice(-limit);

    return lastMessages.map((msg: any) => ({
      id: msg._id
        ? msg._id.toString()
        : `_${Math.random().toString(36).substr(2, 9)}`,
      content: msg.content,
      isChatBot: msg.role === "assistant",
    }));
  } catch (error: any) {
    console.error("[DEBUG] Service GetHistory Error:", error.message);
    throw error;
  }
};
