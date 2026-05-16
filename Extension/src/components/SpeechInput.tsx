import React, { useEffect } from "react";
import { Trash2, Send, Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "../hooks/useSpeechToText";

interface SpeechInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend?: (text: string) => void;
}

const SpeechInput: React.FC<SpeechInputProps> = ({
  value,
  onChange,
  onSend,
}) => {
  const speech = useSpeechToText({
    onFinalText: (text) => {
      onChange(text);
    },
  });

  const toggleMic = () => {
    if (!speech.isListening) speech.start();
    else speech.stop();
  };

  const deleteSpeakContent = () => {
    speech.stop();
    onChange("...");
  };

  useEffect(() => {
    speech.onResult((interim) => {
      onChange(interim || "...");
    });
  }, [onChange, speech]);

  return (
    <div className="flex items-stretch gap-1 w-full">
      <Trash2
        size={22}
        className="stroke-gray-500 hover:bg-gray-500 hover:stroke-white bg-white border border-gray-300 rounded-full p-1 cursor-pointer my-auto"
        onClick={deleteSpeakContent}
      />
      <div className="text-[10px] bg-white h-9 my-auto border border-gray-300 p-1 flex-1 overflow-auto">
        {value}
      </div>
      <div className="my-auto">
        {!speech.isListening ? (
          value !== "..." ? (
            <Send
              size={32}
              color="gray"
              className="border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white"
              onClick={() => onSend?.(value)}
            />
          ) : (
            <Mic
              size={32}
              color="gray"
              className="border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white"
              onClick={toggleMic}
            />
          )
        ) : (
          <MicOff
            size={32}
            color="gray"
            className="border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white"
            onClick={toggleMic}
          />
        )}
      </div>
    </div>
  );
};

export default SpeechInput;
