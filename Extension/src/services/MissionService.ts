// src/services/MissionService.ts
import { GRAMMAR_MAP } from "../data/grammarStore";

/**
 * Interface đại diện cho một nhiệm vụ hàng ngày
 */
export interface Mission {
  id: string;
  name: string;
  meaning: string;
  status: boolean;
}

/**
 * Interface cho phản hồi từ API check grammar
 */
export interface MissionCheckResponse {
  missions: Mission[];
  message: string;
}

const STORAGE_KEY = "daily_missions_data";
const LAST_GEN_KEY = "last_mission_gen_time";
const GRAMMAR_API_URL = "http://localhost:3000/api/grammar/check";

export const MissionService = {
  /**
   * Lấy danh sách nhiệm vụ hiện tại.
   */
  getDailyMissions: (): Mission[] => {
    const now = new Date();
    const lastGenStr = localStorage.getItem(LAST_GEN_KEY);
    const lastGenTime = lastGenStr ? new Date(lastGenStr) : new Date(0);

    const today8AM = new Date();
    today8AM.setHours(8, 0, 0, 0);

    const shouldReset = now >= today8AM && lastGenTime < today8AM;
    const cachedData = localStorage.getItem(STORAGE_KEY);

    if (shouldReset || !cachedData) {
      return MissionService.createNewMissions();
    }

    try {
      return JSON.parse(cachedData);
    } catch (e) {
      return MissionService.createNewMissions();
    }
  },

  /**
   * Tạo 5 nhiệm vụ ngẫu nhiên mới
   */
  createNewMissions: (): Mission[] => {
    const missions: Mission[] = [];
    const usedIndexes = new Set<number>();

    while (missions.length < 5) {
      const randomIndex = Math.floor(Math.random() * 352) + 1;
      const key = `JLPT${randomIndex}`;

      if (!usedIndexes.has(randomIndex) && GRAMMAR_MAP[key]) {
        usedIndexes.add(randomIndex);
        missions.push({
          id: key,
          name: GRAMMAR_MAP[key].grammar,
          meaning: GRAMMAR_MAP[key].meaning,
          status: false,
        });
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    localStorage.setItem(LAST_GEN_KEY, new Date().toISOString());

    return missions;
  },

  /**
   * Gửi danh sách nhiệm vụ lên Backend để AI kiểm tra dựa trên lịch sử chat.
   * Cập nhật lại LocalStorage và trả về cả data + message.
   */
  checkWithAI: async (): Promise<MissionCheckResponse> => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const currentMissions = cached ? JSON.parse(cached) : [];

      const response = await fetch(GRAMMAR_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missions: currentMissions }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Lưu trữ kết quả mới nếu có
      if (data && data.missions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.missions));
        return {
          missions: data.missions,
          message: data.message || "Kiểm tra hoàn tất",
        };
      }

      return { missions: currentMissions, message: "Không có dữ liệu trả về" };
    } catch (error) {
      console.error("MissionService (checkWithAI) Error:", error);
      const cached = localStorage.getItem(STORAGE_KEY);
      return {
        missions: cached ? JSON.parse(cached) : [],
        message: "Lỗi kết nối máy chủ",
      };
    }
  },

  /**
   * Cập nhật trạng thái checkbox thủ công
   */
  updateMissionStatus: (
    missions: Mission[],
    id: string,
    status: boolean
  ): Mission[] => {
    const newList = missions.map((item) =>
      item.id === id ? { ...item, status: status } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    return newList;
  },
};
