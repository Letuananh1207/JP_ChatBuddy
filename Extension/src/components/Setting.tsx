import React from "react";
import { useMode } from "../context/ModeContext";

const Setting: React.FC = () => {
  const { mode, setMode } = useMode();

  return (
    <div className="w-full h-full flex flex-col px-2 py-4">
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
