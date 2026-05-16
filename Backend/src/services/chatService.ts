import Chat from "../models/chatModel";
import { groq, GROQ_MODEL } from "../config/groq";

export const chatWithAI = async (
  conversationId: string | null,
  userMessage: string,
  quote?: string | null, // Thêm tham số quote
  userId?: string | null,
  newConversation: boolean = false,
) => {
  let conversation;

  // 1. Tìm record hiện có: theo ID hoặc tạo mới nếu yêu cầu cuộc hội thoại mới;
  // nếu không thì dùng conversation gần nhất của user.
  if (conversationId) {
    conversation = await Chat.findById(conversationId);
  } else if (newConversation && userId) {
    console.log("--- Creating a new conversation record for user ---");
    conversation = new Chat({ user: userId, messages: [] });
  } else if (userId) {
    // Lấy conversation gần nhất của user này
    conversation = await Chat.findOne({ user: userId }).sort({ updatedAt: -1 });
  } else {
    // Luôn lấy record gần nhất để tiếp tục trò chuyện trong 1 luồng duy nhất
    conversation = await Chat.findOne().sort({ updatedAt: -1 });
  }

  // 2. Nếu không có bất kỳ record nào trong DB, mới tạo cái đầu tiên
  if (!conversation) {
    console.log("--- Creating a new conversation record ---");
    const init: any = { messages: [] };
    if (userId) init.user = userId;
    conversation = new Chat(init);
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
    return await saveAndReturn(conversation, userMessage, aiResponse, userId);
  } catch (error: any) {
    console.error("❌ Groq API Error:", error.message);
    throw new Error(
      error.message.includes("429") ? "Konny bận quậy rồi!" : "Lỗi kết nối AI.",
    );
  }
};

async function saveAndReturn(
  conversation: any,
  userMsg: string,
  aiMsg: string,
  userId?: string | null,
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

  // Đảm bảo gắn user nếu có
  if (userId && !conversation.user) {
    conversation.user = userId;
  }

  conversation.updatedAt = new Date();
  await conversation.save();

  return {
    conversationId: conversation._id,
    reply: aiMsg,
  };
}

const mapMessages = (messages: any[], limit: number) => {
  const lastMessages = messages.slice(-limit);
  return lastMessages.map((msg: any) => ({
    id: msg._id
      ? msg._id.toString()
      : `_${Math.random().toString(36).substr(2, 9)}`,
    content: msg.content,
    isChatBot: msg.role === "assistant",
  }));
};

/**
 * Lấy lịch sử theo conversationId hoặc cuộc hội thoại mới nhất của user
 */
export const getHistory = async (
  limit: number = 20,
  userId?: string | null,
  conversationId?: string | null,
) => {
  try {
    let conversation: any;

    if (conversationId) {
      const query: any = { _id: conversationId };
      if (userId) query.user = userId;
      conversation = await Chat.findOne(query).lean();
    } else {
      const query = userId ? { user: userId } : {};
      conversation = await Chat.findOne(query)
        .sort({ updatedAt: -1 })
        .lean();
    }

    if (!conversation || !conversation.messages) return [];
    return mapMessages(conversation.messages, limit);
  } catch (error: any) {
    console.error("[DEBUG] Service GetHistory Error:", error.message);
    throw error;
  }
};

/**
 * Danh sách các phiên trò chuyện của user (mới nhất trước)
 */
export const getConversations = async (
  userId: string,
  limit: number = 10,
) => {
  const conversations = await Chat.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  return conversations.map((conv: any) => {
    const lastUserMsg = [...(conv.messages || [])]
      .reverse()
      .find((m: any) => m.role === "user");
    const preview =
      lastUserMsg?.content?.slice(0, 24) ||
      (conv.messages?.length ? "..." : "Phiên mới");

    return {
      id: conv._id.toString(),
      preview,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages?.length || 0,
    };
  });
};
