// src/services/api.ts

const BASE_URL = "http://localhost:3000/api";
const VOCAB_API_URL = `${BASE_URL}/vocabulary`;
const CHAT_API_URL = `${BASE_URL}/chat`;
const GRAMMAR_API_URL = `${BASE_URL}/grammar`;

// Định nghĩa interface để đồng bộ dữ liệu gửi lên Konny
export interface SendMessagePayload {
  message: string;
  quote?: string | null;
}

// --- PHẦN TỪ VỰNG ---
export const vocabularyService = {
  addWord: async (word: string, meaning: string) => {
    try {
      const response = await fetch(`${VOCAB_API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, meaning, date: new Date() }),
      });
      if (!response.ok) throw new Error("Không thể thêm từ vựng");
      return await response.json();
    } catch (error) {
      console.error("API Error (addWord):", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await fetch(`${VOCAB_API_URL}/all`);
      if (!response.ok) throw new Error("Không thể lấy danh sách từ vựng");
      return await response.json();
    } catch (error) {
      console.error("API Error (getAll):", error);
      throw error;
    }
  },

  deleteWord: async (id: string) => {
    const response = await fetch(`${VOCAB_API_URL}/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  },
};

// --- PHẦN CHAT CỦA KONNY ---
export const chatService = {
  fetchHistory: async (limit?: number) => {
    try {
      const url = limit
        ? `${CHAT_API_URL}/history?limit=${limit}`
        : `${CHAT_API_URL}/history`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Không thể lấy lịch sử chat");
      return await response.json();
    } catch (error) {
      console.error("API Error (fetchHistory):", error);
      throw error;
    }
  },

  /**
   * Cập nhật: Nhận vào payload chứa message và quote
   */
  sendMessage: async (payload: SendMessagePayload) => {
    try {
      const response = await fetch(`${CHAT_API_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Gửi cả object { message, quote }
      });
      if (!response.ok) throw new Error("Konny không trả lời...");
      return await response.json();
    } catch (error) {
      console.error("API Error (sendMessage):", error);
      throw error;
    }
  },
};

// --- PHẦN KIỂM TRA NGỮ PHÁP NHIỆM VỤ ---
export const grammarCheckService = {
  checkMissions: async (userMessage: string) => {
    try {
      const response = await fetch(`${GRAMMAR_API_URL}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) throw new Error("Lỗi kiểm tra ngữ pháp");
      return await response.json();
    } catch (error) {
      console.error("API Error (checkGrammar):", error);
      return null;
    }
  },
};
