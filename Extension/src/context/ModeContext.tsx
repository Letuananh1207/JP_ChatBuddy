import React, { createContext, useContext, useState, useEffect } from "react";

/* ===== Types ===== */
export type Mode = "read" | "listen";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

/* ===== Context ===== */
const ModeContext = createContext<ModeContextType | undefined>(undefined);

/* ===== Provider ===== */
export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<Mode>("read");

  // 1. Lấy trạng thái đã lưu khi ứng dụng khởi chạy
  useEffect(() => {
    // Kiểm tra an toàn cho môi trường extension
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      // Định nghĩa kiểu cho result để tránh lỗi 'any'
      chrome.storage.local.get(
        ["appMode"],
        (result: { [key: string]: any }) => {
          if (result.appMode) {
            setModeState(result.appMode as Mode);
          }
        }
      );
    }
  }, []);

  // 2. Hàm setMode mới: Vừa cập nhật State vừa lưu vào Storage
  const setMode = (newMode: Mode) => {
    setModeState(newMode);

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ appMode: newMode }, () => {
        console.log("Đã lưu chế độ mới:", newMode);
      });
    }
  };

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

/* ===== Custom hook ===== */
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used inside ModeProvider");
  }
  return context;
};
