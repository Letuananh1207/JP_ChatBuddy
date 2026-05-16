import React, { useState, useEffect, useCallback, useMemo } from "react";
import SpeechInput from "./SpeechInput";
import { Play, BookOpen } from "lucide-react";
import { useVocabQuery } from "../hooks/useVocabQuery";

const WordGame: React.FC = () => {
  const { vocabQuery } = useVocabQuery();

  // States cấu hình Game
  const [isStarted, setIsStarted] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [maxTime, setMaxTime] = useState(10);
  const [filterDays, setFilterDays] = useState(3); // Mặc định lọc 3 ngày

  // States logic Game
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(10);
  const [input, setInput] = useState("...");
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // 1. Logic lọc từ vựng thực tế từ Database
  const gameData = useMemo(() => {
    if (!vocabQuery.data) return [];

    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - filterDays);

    return vocabQuery.data
      .filter((item: any) => new Date(item.date || item.createdAt) >= limitDate)
      .map((item: any) => ({
        def: item.meaning,
        matches: [item.word], // Bạn có thể thêm logic chuyển Hiragana/Romaji nếu cần
      }));
  }, [vocabQuery.data, filterDays, isStarted]); // Chỉ tính toán lại khi bắt đầu hoặc đổi filter

  const resetGame = () => {
    setIsStarted(false);
    setIdx(0);
    setHearts(3);
    setTime(maxTime);
    setInput("...");
    setLost(false);
    setWon(false);
    setFeedback(null);
  };

  const next = useCallback(() => {
    if (idx + 1 >= gameData.length) {
      setWon(true);
      return;
    }
    setInput("...");
    setTime(maxTime);
    setIdx((prev) => prev + 1);
  }, [idx, maxTime, gameData.length]);

  const handleWrong = useCallback(() => {
    setFeedback({ type: "error", msg: "Incorrect" });
    setTimeout(() => setFeedback(null), 800);
    if (hearts > 1) {
      setHearts((h) => h - 1);
      next();
    } else {
      setHearts(0);
      setLost(true);
    }
  }, [hearts, next]);

  useEffect(() => {
    if (!isStarted || lost || won || hearts <= 0) return;
    if (time <= 0) {
      handleWrong();
      return;
    }
    const t = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [time, lost, won, hearts, handleWrong, isStarted]);

  const handleCheckAnswer = (finalText: string) => {
    if (finalText === "..." || won || lost || !gameData[idx]) return;

    const isCorrect = gameData[idx].matches.some(
      (m: string) => m.toLowerCase().trim() === finalText.trim().toLowerCase()
    );

    if (isCorrect) {
      setFeedback({ type: "success", msg: "Correct" });
      setTimeout(() => {
        setFeedback(null);
        next();
      }, 800);
    } else {
      handleWrong();
    }
  };

  const paperBg = "bg-[#f4f1ea]";

  // --- MÀN HÌNH LOBBY ---
  if (!isStarted) {
    return (
      <div
        className={`h-[280px] w-full flex flex-col p-6 ${paperBg} border-2 border-black rounded-sm overflow-y-auto scrollbar-hide`}
      >
        <div className="flex-1 space-y-4">
          {/* LỰA CHỌN PHẠM VI TỪ VỰNG */}
          <section>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold flex items-center gap-1">
              <BookOpen size={10} /> Phạm vi từ vựng
            </p>
            <div className="flex gap-4">
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDays(d)}
                  className={`text-xs transition-all ${
                    filterDays === d
                      ? "text-black font-black border-b-2 border-black"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  {d === 1 ? "Hôm nay" : `${d} ngày`}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">
              Mạng
            </p>
            <div className="flex gap-4">
              {[1, 3, 5].map((h) => (
                <button
                  key={h}
                  onClick={() => setHearts(h)}
                  className={`text-xs transition-all ${
                    hearts === h
                      ? "text-black font-black border-b-2 border-black"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  0{h}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">
              Thời gian
            </p>
            <div className="flex gap-4">
              {[10, 20, 30].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setMaxTime(s);
                    setTime(s);
                  }}
                  className={`text-xs transition-all ${
                    maxTime === s
                      ? "text-black font-black border-b-2 border-black"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[9px] text-gray-400 italic">
            {gameData.length > 0
              ? `${gameData.length} từ sẵn sàng`
              : "Không có từ nào"}
          </span>
          <button
            disabled={gameData.length === 0}
            onClick={() => setIsStarted(true)}
            className="flex items-center justify-center gap-2 border-2 border-black px-4 py-1 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            Bắt đầu <Play size={10} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH KẾT THÚC ---
  if (won || lost) {
    return (
      <div
        className={`h-[280px] w-full flex flex-col items-center justify-center p-8 ${paperBg} border-2 border-black rounded-sm`}
      >
        <span className="text-5xl mb-2 font-black italic">
          {won ? "WIN" : "FAIL"}
        </span>
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
          {won ? "Hoàn thành xuất sắc" : "Cố gắng lần sau nhé"}
        </h2>
        <button
          onClick={resetGame}
          className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-8 py-2 hover:bg-black hover:text-white transition-all"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // --- MÀN HÌNH CHƠI GAME ---
  return (
    <div
      className={`h-full flex flex-col ${paperBg} p-6 relative font-sans border-2 border-black`}
    >
      <div className="flex justify-between items-baseline">
        <div className="text-xs font-black uppercase italic">HP: {hearts}</div>
        <div className="text-[9px] tracking-[0.2em] font-black uppercase text-gray-400">
          {idx + 1} / {gameData.length}
        </div>
        <div
          className={`text-sm font-black italic ${
            time < 4 ? "text-red-600 animate-pulse" : "text-black"
          }`}
        >
          {time}s
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {feedback && (
          <div
            className={`absolute z-20 text-2xl italic font-black uppercase tracking-widest ${
              feedback.type === "success" ? "text-black" : "text-red-600"
            }`}
          >
            {feedback.msg}
          </div>
        )}
        <div
          className={`transition-opacity ${
            feedback ? "opacity-10" : "opacity-100"
          }`}
        >
          <h2 className="text-2xl font-black text-black italic tracking-tighter uppercase border-b-4 border-black pb-2 text-center">
            {gameData[idx]?.def}
          </h2>
        </div>
      </div>

      <div className="mt-auto">
        <SpeechInput
          value={input}
          onChange={setInput}
          onSend={handleCheckAnswer}
        />
      </div>
    </div>
  );
};

export default WordGame;
