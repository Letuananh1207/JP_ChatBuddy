import { useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechProps {
  lang?: string;
  onFinalText?: (text: string) => void;
  silenceMs?: number;
}

export const useSpeechToText = ({
  lang = "ja-JP",
  onFinalText,
  silenceMs = 5000,
}: UseSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅ FIX NodeJS

  if (!recognitionRef.current) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; // ✅ FIX type
    if (!SR) {
      console.error("❌ SpeechRecognition không hỗ trợ");
      return {
        start: () => {},
        stop: () => {},
        onResult: () => {},
        isListening: false,
      };
    }

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    recognitionRef.current = rec;
  }

  const recognition = recognitionRef.current;

  const resetTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      console.log("⛔ Tự stop vì im lặng");
      stop();
    }, silenceMs);
  };

  const start = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      resetTimer();
      recognition.start();
      console.log("🎤 Listening...");
    } catch (err) {
      console.error("❌ Không có quyền micro:", err);
    }
  };

  const stop = () => {
    setIsListening(false);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    try {
      recognition.stop();
    } catch {}
  };

  const onResult = (cb: (interim: string, final: string) => void) => {
    recognition.onresult = (event: any) => {
      resetTimer();
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      cb(interim, final);
      if (final && onFinalText) onFinalText(final);
    };

    recognition.onerror = (e: any) => console.error("🎤 Error:", e.error);

    recognition.onend = () => {
      if (isListening) {
        console.log("🔁 Restarting...");
        try {
          recognition.start();
        } catch {}
      }
    };
  };

  return { start, stop, onResult, isListening };
};
