// src/services/api.ts

const API_BASE_URL = "http://localhost:3000";
const BASE_URL = `${API_BASE_URL}/api`;
const VOCAB_API_URL = `${BASE_URL}/vocabulary`;
const CHAT_API_URL = `${BASE_URL}/chat`;
const GRAMMAR_API_URL = `${BASE_URL}/grammar`;

const TOKEN_KEY = "token";
const USER_KEY = "user";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const saveAuthData = (token: string, user: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const buildHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface SendMessagePayload {
  message: string;
  conversationId?: string;
  quote?: string | null;
  newConversation?: boolean;
}

export interface AuthPayload {
  email: string;
  password: string;
  username?: string;
}

const parseError = async (response: Response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.message || json.error || text || response.statusText;
  } catch {
    return text || response.statusText;
  }
};

export const authService = {
  getToken: getAuthToken,
  getUser: getStoredUser,
  logout: () => clearAuthData(),

  register: async ({ username, email, password }: AuthPayload) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorText = await parseError(response);
      throw new Error(`Đăng ký thất bại: ${errorText}`);
    }

    const data = await response.json();
    if (data.token) {
      saveAuthData(data.token, data.user ?? {});
    }
    return data;
  },

  login: async ({ email, password }: AuthPayload) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await parseError(response);
      throw new Error(`Đăng nhập thất bại: ${errorText}`);
    }

    const data = await response.json();
    if (data.token) {
      saveAuthData(data.token, data.user ?? {});
    }
    return data;
  },
};

export const vocabularyService = {
  addWord: async (word: string, meaning: string) => {
    try {
      const response = await fetch(`${VOCAB_API_URL}/add`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ word, meaning }),
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
      const response = await fetch(`${VOCAB_API_URL}/all`, {
        method: "GET",
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error("Không thể lấy danh sách từ vựng");
      return await response.json();
    } catch (error) {
      console.error("API Error (getAll):", error);
      throw error;
    }
  },

  deleteWord: async (id: string) => {
    try {
      const response = await fetch(`${VOCAB_API_URL}/${id}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error("Không thể xóa từ vựng");
      return await response.json();
    } catch (error) {
      console.error("API Error (deleteWord):", error);
      throw error;
    }
  },
};

export interface ConversationSummary {
  id: string;
  preview: string;
  updatedAt: string;
  messageCount: number;
}

export const chatService = {
  fetchConversations: async (limit = 10): Promise<ConversationSummary[]> => {
    try {
      const response = await fetch(
        `${CHAT_API_URL}/conversations?limit=${limit}`,
        {
          method: "GET",
          headers: buildHeaders(),
        },
      );
      if (!response.ok) throw new Error("Không thể lấy danh sách phiên chat");
      return await response.json();
    } catch (error) {
      console.error("API Error (fetchConversations):", error);
      throw error;
    }
  },

  fetchHistory: async (limit?: number, conversationId?: string) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      if (conversationId) params.set("conversationId", conversationId);
      const query = params.toString();
      const url = query
        ? `${CHAT_API_URL}/history?${query}`
        : `${CHAT_API_URL}/history`;
      const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error("Không thể lấy lịch sử chat");
      return await response.json();
    } catch (error) {
      console.error("API Error (fetchHistory):", error);
      throw error;
    }
  },

  sendMessage: async (payload: SendMessagePayload) => {
    try {
      const response = await fetch(`${CHAT_API_URL}/send`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Konny không trả lời...");
      return await response.json();
    } catch (error) {
      console.error("API Error (sendMessage):", error);
      throw error;
    }
  },
};

export const grammarCheckService = {
  checkMissions: async (missions: unknown[]) => {
    try {
      const response = await fetch(`${GRAMMAR_API_URL}/check`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ missions }),
      });

      if (!response.ok) throw new Error("Lỗi kiểm tra ngữ pháp");
      return await response.json();
    } catch (error) {
      console.error("API Error (checkGrammar):", error);
      return null;
    }
  },
};
