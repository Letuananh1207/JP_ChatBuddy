import React from "react";
import { useMode } from "../context/ModeContext";
import { authService } from "../services/api";

const Setting: React.FC = () => {
  const { mode, setMode } = useMode();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    // reload to show login screen
    window.location.reload();
  };

  return (
    <div className="w-full h-full flex flex-col px-2 py-3">
      {/* User info */}
      <div className="flex items-center justify-between mb-3 px-2 py-2 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[12px] text-slate-600">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-[12px]">
            <div className="font-medium text-[13px] text-slate-900 truncate">
              {user?.username ?? user?.email ?? "Người dùng"}
            </div>
            <div className="text-[11px] text-slate-500">Tài khoản</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
        >
          Đăng xuất
        </button>
      </div>

      {/* Modes */}
      <div className="flex items-center gap-6 text-xs">
        <div className="font-medium text-sm">Chế độ :</div>

        <label
          className={`flex items-center gap-2 cursor-pointer transition-colors
            ${mode === "read" ? "text-gray-500" : "text-gray-300"}`}
        >
          <input
            type="radio"
            name="mode"
            value="read"
            checked={mode === "read"}
            onChange={() => setMode("read")}
            className="hidden"
          />
          <span className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
            {mode === "read" && (
              <span className="w-2 h-2 rounded-full bg-gray-500" />
            )}
          </span>
          <span>Đọc</span>
        </label>

        <label
          className={`flex items-center gap-2 cursor-pointer transition-colors
            ${mode === "listen" ? "text-gray-500" : "text-gray-300"}`}
        >
          <input
            type="radio"
            name="mode"
            value="listen"
            checked={mode === "listen"}
            onChange={() => setMode("listen")}
            className="hidden"
          />
          <span className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
            {mode === "listen" && (
              <span className="w-2 h-2 rounded-full bg-gray-500" />
            )}
          </span>
          <span>Nghe</span>
        </label>
      </div>
    </div>
  );
};

export default Setting;
