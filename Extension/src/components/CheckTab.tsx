// src/components/CheckTab.tsx
import React, { useState, useEffect } from "react";
import { MissionService, type Mission } from "../services/MissionService";
import { Info, Loader2, Bell } from "lucide-react";

const CheckTab: React.FC = () => {
  const [checkList, setcheckList] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const dailyData = MissionService.getDailyMissions();
    setcheckList(dailyData);
  }, []);

  // Tự động ẩn thông báo sau 3 giây
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCheckMissions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setNotification(null);

    try {
      // MissionService.checkWithAI() trả về kiểu MissionCheckResponse { missions, message }
      const response = await MissionService.checkWithAI();

      if (response && response.missions) {
        setcheckList(response.missions); // Cập nhật danh sách nhiệm vụ
        setNotification(response.message); // Hiển thị chú thích từ Backend
      }
    } catch (error) {
      console.error("Lỗi kiểm tra nhiệm vụ:", error);
      setNotification("Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-start py-4 px-6">
      {/* THÔNG BÁO (TOAST UI) */}
      {notification && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-[10002] w-[85%] 
                        bg-black text-white text-[9px] py-1.5 px-3 rounded-full 
                        flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300"
        >
          <Bell size={10} className="text-yellow-400" />
          <span className="flex-1 truncate">{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* LỚP PHỦ LOADING */}
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
        </div>
      )}

      {/* DANH SÁCH NHIỆM VỤ */}
      <div
        className={`flex flex-col w-full text-lg gap-4 transition-all duration-300 ${
          isLoading ? "blur-[1px]" : ""
        }`}
      >
        {checkList.map((item) => (
          <div key={item.id} className="w-full">
            <label
              className="flex gap-4 items-center w-full cursor-default overflow-hidden"
              htmlFor={item.id}
            >
              <input
                className="appearance-none w-5 h-5 border-2 border-black rounded-sm flex-shrink-0 
                           checked:bg-black checked:border-black flex items-center justify-center 
                           transition-all duration-150 relative pointer-events-none
                           checked:before:content-['✓'] checked:before:text-white checked:before:text-[10px] 
                           checked:before:absolute checked:before:top-[1px] checked:before:left-[3px]"
                checked={item.status}
                id={item.id}
                type="checkbox"
                readOnly
              />
              <div className="flex flex-col text-sm leading-tight select-none min-w-0 flex-1">
                <span
                  className={`transition-all truncate block ${
                    item.status
                      ? "line-through text-gray-400"
                      : "text-black font-medium"
                  }`}
                  title={item.name}
                >
                  {item.name}
                </span>
                <span
                  className="text-[11px] text-gray-400 font-normal truncate block mt-0.5"
                  title={item.meaning}
                >
                  ({item.meaning})
                </span>
              </div>
            </label>
          </div>
        ))}

        {checkList.length === 0 && (
          <span className="text-gray-300 text-sm italic text-center w-full">
            Đang tải nhiệm vụ...
          </span>
        )}
      </div>

      {/* NÚT ĐÁNH DẤU */}
      <div className="flex flex-col items-center gap-1 absolute w-[56px] z-[9999] top-1/2 -left-17 text-[10px]">
        <div
          onClick={handleCheckMissions}
          className={`w-full py-1 bg-white cursor-pointer text-center border border-transparent active:scale-95 transition-all shadow-sm ${
            isLoading
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-500 hover:text-white"
          }`}
        >
          {isLoading ? "..." : "Đánh dấu"}
        </div>
        <div title="Nhiệm vụ được tự động đánh giá dựa trên lịch sử trò chuyện hôm nay của bạn">
          <Info
            size={10}
            className={isLoading ? "text-gray-300" : "text-gray-500"}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckTab;
