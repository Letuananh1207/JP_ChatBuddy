import React, { useState, useRef, useEffect } from "react";
import { Volume2, Square, MoreHorizontal } from "lucide-react";
import { useMode } from "../context/ModeContext";
// Import cấu hình giọng nói
import { VOICE_SETTINGS, VOICEVOX_BASE_URL } from "../config/voiceConfigs";

interface SpeechBubbleProps {
  content: string;
  isChatBot: boolean;
  autoSpeak?: boolean;
  onPlayed?: () => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  isChatBot,
  content,
  autoSpeak,
  onPlayed,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "speaking">("idle");
  const audioQueue = useRef<{ url: string; index: number }[]>([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasSpoken = useRef(false);
  const nextIndexToPlay = useRef(0);
  const totalChunksRef = useRef(0);

  const { mode } = useMode();

  useEffect(() => {
    if (isChatBot && autoSpeak && !hasSpoken.current) {
      hasSpoken.current = true;
      handleStreamingSpeak(content);
    }
  }, [autoSpeak, isChatBot, content]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const stopSpeaking = () => {
    isPlayingRef.current = false;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.onended = null;
      currentAudioRef.current = null;
    }
    audioQueue.current.forEach((item) => URL.revokeObjectURL(item.url));
    audioQueue.current = [];
    nextIndexToPlay.current = 0;
    totalChunksRef.current = 0;
    setStatus("idle");
  };

  const splitText = (text: string) => {
    return text
      .split(/([。？！.?!])/g)
      .reduce((acc: string[], cur, i) => {
        if (i % 2 === 0) acc.push(cur);
        else acc[acc.length - 1] += cur;
        return acc;
      }, [])
      .filter((t) => t.trim().length > 0);
  };

  const playQueue = () => {
    if (!isPlayingRef.current) return;

    if (
      nextIndexToPlay.current >= totalChunksRef.current &&
      totalChunksRef.current > 0
    ) {
      setStatus("idle");
      isPlayingRef.current = false;
      if (onPlayed) onPlayed();
      return;
    }

    const currentItem = audioQueue.current.find(
      (item) => item.index === nextIndexToPlay.current
    );

    if (!currentItem) {
      setStatus("loading");
      return;
    }

    const audio = new Audio(currentItem.url);
    currentAudioRef.current = audio;
    setStatus("speaking");

    audio.onended = () => {
      URL.revokeObjectURL(currentItem.url);
      nextIndexToPlay.current++;
      currentAudioRef.current = null;
      playQueue();
    };

    audio.play().catch((e) => {
      console.error("Play error:", e);
      stopSpeaking();
    });
  };

  const handleStreamingSpeak = async (text: string) => {
    stopSpeaking();
    const chunks = splitText(text);
    if (chunks.length === 0) return;

    totalChunksRef.current = chunks.length;
    setStatus("loading");
    isPlayingRef.current = true;

    chunks.forEach(async (chunk, index) => {
      try {
        const url = await fetchVoiceVoxAudio(chunk);
        if (url && isPlayingRef.current) {
          audioQueue.current.push({ url, index });
          if (index === nextIndexToPlay.current && status !== "speaking") {
            playQueue();
          }
        }
      } catch (err) {
        console.error("Fetch chunk error:", err);
      }
    });
  };

  // Cập nhật hàm fetch sử dụng Config và các thông số tối ưu
  const fetchVoiceVoxAudio = async (text: string) => {
    const {
      SPEAKER_ID,
      SPEED_SCALE,
      PITCH_SCALE,
      INTONATION_SCALE,
      VOLUME_SCALE,
    } = VOICE_SETTINGS;

    try {
      // Bước 1: Tạo Audio Query
      const queryUrl = `${VOICEVOX_BASE_URL}/audio_query?text=${encodeURIComponent(
        text
      )}&speaker=${SPEAKER_ID}`;
      const queryRes = await fetch(queryUrl, { method: "POST" });

      if (!queryRes.ok) throw new Error("Audio query failed");

      const query = await queryRes.json();

      // --- ÁP DỤNG THÔNG SỐ CẤU HÌNH ---
      query.speedScale = SPEED_SCALE; // Tốc độ nhanh hơn (mặc định 1.0)
      query.pitchScale = PITCH_SCALE; // Cao độ giọng nói
      query.intonationScale = INTONATION_SCALE; // Độ nhấn nhá cảm xúc
      query.volumeScale = VOLUME_SCALE; // Âm lượng
      // ------------------------------------------

      // Bước 2: Tổng hợp giọng nói (Synthesis)
      const synthesisUrl = `${VOICEVOX_BASE_URL}/synthesis?speaker=${SPEAKER_ID}`;
      const audioRes = await fetch(synthesisUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });

      if (!audioRes.ok) throw new Error("Synthesis failed");

      const blob = await audioRes.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("VoiceVox Error:", err);
      return null;
    }
  };

  const renderAudioIcon = (iconSize: number) => {
    if (status === "loading") {
      return (
        <MoreHorizontal
          size={iconSize}
          className="animate-pulse text-blue-500 cursor-pointer"
          onClick={stopSpeaking}
        />
      );
    }
    if (status === "speaking") {
      return (
        <div
          className="relative flex items-center justify-center"
          onClick={stopSpeaking}
        >
          <Square
            size={iconSize - 2}
            className="fill-red-500 text-red-500 cursor-pointer hover:scale-110 transition-transform"
          />
          <span className="absolute -inset-1 rounded-full border border-red-400 animate-ping opacity-30"></span>
        </div>
      );
    }
    return (
      <Volume2
        className="cursor-pointer hover:text-blue-500 transition-colors text-gray-400"
        size={iconSize}
        onClick={() => handleStreamingSpeak(content)}
      />
    );
  };

  return (
    <div
      className={`relative flex ${
        isChatBot ? "flex-row-reverse" : "flex-row"
      } items-start justify-end gap-2 w-full mb-2 animate-in fade-in slide-in-from-bottom-1 duration-300`}
    >
      <div className="flex flex-col items-end gap-1 max-w-[75%]">
        {mode === "listen" && isChatBot ? (
          <div className="min-h-[2rem] min-w-[2.5rem] flex justify-center items-center border border-gray-300 rounded-2xl py-1 px-3 bg-white shadow-sm border-dashed">
            {renderAudioIcon(16)}
          </div>
        ) : (
          <div
            className={`relative flex items-start gap-2 border border-gray-300 rounded-2xl py-2 px-3 bg-white shadow-sm ${
              !isChatBot && "bg-gray-100"
            }`}
          >
            <div className="flex-1 break-words text-[10px] leading-tight text-gray-800">
              {content}
            </div>
            {isChatBot && (
              <div className="flex-shrink-0 mt-0.5">{renderAudioIcon(12)}</div>
            )}
          </div>
        )}
      </div>
      <div
        className={`relative w-8 h-8 flex-shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center overflow-hidden transition-all ${
          status === "speaking" ? "border-blue-400 ring-2 ring-blue-100" : ""
        }`}
      >
        <img
          src={isChatBot ? "./conny_chi.png" : "./user_conny.png"}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );
};

export default SpeechBubble;
