import SpeechBubble from "./SpeechBubble";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  TriangleAlert,
  Check,
  Send,
  Trash2,
  CornerDownRight,
  X,
  Loader2,
} from "lucide-react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useChatQuery } from "../hooks/useChatQuery";

interface ErrorItem {
  wrong: string;
  suggestion: string;
  note: string;
}

interface CheckResult {
  errors: ErrorItem[];
  corrected: string;
  explanation: string;
}

interface HomeProps {
  quote?: string;
  onDeleteQuote?: () => void;
  conversationId?: string | null;
  isNewDraft?: boolean;
  onConversationCreated?: (id: string) => void;
  onStartNewConversation?: () => void;
  onSelectConversation?: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({
  quote,
  onDeleteQuote,
  conversationId = null,
  isNewDraft = false,
  onConversationCreated,
  onStartNewConversation,
  onSelectConversation,
}) => {
  const [speakContent, setSpeakContent] = useState("...");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // CHỐT CHẶN 1: Chỉ bật lên TRUE khi người dùng thực hiện hành động GỬI
  const isNewlySent = useRef(false);

  // CHỐT CHẶN 2: Lưu ID tin nhắn cụ thể của Bot để phát âm
  const [targetSpeakId, setTargetSpeakId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null
  );

  const { historyQuery, sendMutation, conversationsQuery } = useChatQuery(
    conversationId,
    { isNewDraft },
  );
  const dialogHistory = isNewDraft ? [] : historyQuery.data || [];
  const conversations = conversationsQuery.data || [];

  const speech = useSpeechToText({
    onFinalText: (text) => setSpeakContent(text),
  });

  useEffect(() => {
    speech.onResult((interim) => setSpeakContent(interim || "..."));
  }, []);

  // Theo dõi sự thay đổi của dialogHistory để xác định tin nhắn Bot mới nhất cần nói
  useEffect(() => {
    if (dialogHistory.length > 0 && isNewlySent.current) {
      const lastMsg = dialogHistory[dialogHistory.length - 1];
      // Nếu tin nhắn cuối cùng là Bot VÀ chúng ta đang trong luồng vừa gửi tin
      if (lastMsg.isChatBot) {
        setTargetSpeakId(lastMsg.id);
        // Sau khi đã xác định được ID mục tiêu, hạ cờ gửi tin để tránh phát nhầm khi re-render
        isNewlySent.current = false;
      }
    }
  }, [dialogHistory]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [dialogHistory, sendMutation.isPending, pendingUserMessage]);

  const toggleMic = () => {
    if (!speech.isListening) speech.start();
    else speech.stop();
  };

  const deleteSpeakContent = () => {
    speech.stop();
    setSpeakContent("...");
    setCheckResult(null);
  };

  const handleSendMessage = () => {
    if (speakContent === "..." || !speakContent.trim()) return;

    // KÍCH HOẠT: Cho phép hệ thống tìm tin nhắn Bot mới nhất
    isNewlySent.current = true;

    setPendingUserMessage(speakContent);

    // ĐÓNG GÓI PAYLOAD: Gửi kèm quote nếu có để Backend/AI hiểu ngữ cảnh
    const payload = {
      message: speakContent,
      quote: quote || null,
      conversationId: conversationId || undefined,
      newConversation: isNewDraft,
    };

    setSpeakContent("...");
    setCheckResult(null);

    sendMutation.mutate(payload, {
      onSuccess: (data) => {
        setPendingUserMessage(null);
        if (data?.conversationId && onConversationCreated) {
          onConversationCreated(data.conversationId);
        }
        if (quote && onDeleteQuote) {
          onDeleteQuote();
        }
      },
      onError: () => {
        setPendingUserMessage(null);
        isNewlySent.current = false;
        console.error("Gửi tin nhắn thất bại");
      },
    });
  };

  return (
    <div className="relative flex flex-col gap-2 items-stretch flex-1 pt-2 h-full pr-2">
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar shrink-0 pb-0.5">
        <button
          type="button"
          onClick={onStartNewConversation}
          title="Phiên trò chuyện mới"
          className={`shrink-0 text-[9px] px-1.5 py-0.5 border rounded cursor-pointer transition-all ${
            isNewDraft
              ? "bg-gray-500 text-white border-gray-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-500 hover:text-white"
          }`}
        >
          + Mới
        </button>
        {conversations.map((conv) => {
          const isActive =
            !isNewDraft &&
            (conversationId === conv.id ||
              (!conversationId && conversations[0]?.id === conv.id));
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation?.(conv.id)}
              title={conv.preview}
              className={`shrink-0 max-w-[72px] truncate text-[9px] px-1.5 py-0.5 border rounded cursor-pointer transition-all ${
                isActive
                  ? "bg-gray-500 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-500 hover:text-white"
              }`}
            >
              {conv.preview}
            </button>
          );
        })}
      </div>

      <div
        className="flex flex-1 flex-col gap-4 overflow-auto hide-scrollbar pb-4 mt-1"
        ref={containerRef}
      >
        {historyQuery.isLoading && !isNewDraft ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-xs">
            <Loader2 className="animate-spin mr-2" size={14} />
            Konny đang lục lại trí nhớ...
          </div>
        ) : (
          <>
            {dialogHistory.map((item: any) => (
              <SpeechBubble
                isChatBot={item.isChatBot}
                content={item.content}
                key={item.id}
                autoSpeak={item.id === targetSpeakId}
                onPlayed={() => setTargetSpeakId(null)}
              />
            ))}

            {pendingUserMessage && (
              <SpeechBubble isChatBot={false} content={pendingUserMessage} />
            )}
          </>
        )}

        {sendMutation.isPending && (
          <div className="self-start ml-2 text-[10px] text-gray-500 italic animate-pulse">
            Konny đang gõ... 😈
          </div>
        )}
      </div>

      {/* Khu vực nhập liệu */}
      <div className="relative w-full h-12 bg-[url(/manga_paper_normal.png)] bg-contain bg-center flex justify-center px-1">
        {quote && (
          <div className="flex items-center absolute w-full text-[12px] -top-5 bg-gray-200 px-1 rounded-t-xl py-1 shadow-inner animate-in slide-in-from-bottom-2">
            <CornerDownRight size={10} className="mr-1 text-gray-500" />
            <span className="flex-1 truncate">{quote}</span>
            <X
              size={14}
              className="ml-2 cursor-pointer hover:text-red-500 transition-colors"
              onClick={onDeleteQuote}
            />
          </div>
        )}

        <div className="flex flex-1 items-stretch gap-1">
          <div
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="flex flex-col items-center justify-evenly absolute right-0 bottom-13"
          >
            {checkResult?.errors?.length ? (
              <TriangleAlert size={12} color="green" className="absolute" />
            ) : (
              checkResult && (
                <div className="flex gap-2">
                  <Check size={12} color="green" />
                </div>
              )
            )}
          </div>

          <Trash2
            size={22}
            className="stroke-gray-500 hover:bg-gray-500 hover:stroke-white bg-white border border-gray-300 rounded-full p-1 cursor-pointer my-auto"
            onClick={deleteSpeakContent}
          />

          <div className="text-[10px] bg-white border border-gray-300 p-1 flex-1 overflow-auto h-9 my-auto scrollbar-hide">
            {speakContent}
          </div>

          <div className="my-auto">
            {!speech.isListening ? (
              !checkResult?.errors.length && speakContent !== "..." ? (
                <Send
                  size={32}
                  className={`border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white transition-all ${
                    sendMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  color="gray"
                  onClick={handleSendMessage}
                />
              ) : (
                <Mic
                  size={32}
                  color="gray"
                  className="border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white transition-all"
                  onClick={toggleMic}
                />
              )
            ) : (
              <MicOff
                size={32}
                color="gray"
                className="border border-gray-300 rounded-full p-2 bg-white cursor-pointer hover:bg-gray-500 hover:stroke-white transition-all"
                onClick={toggleMic}
              />
            )}
          </div>
        </div>

        {/* Tooltip lỗi ngữ pháp */}
        {hovering && checkResult?.errors?.length ? (
          <div className="absolute bottom-full mb-1 right-1 w-64 max-h-48 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs z-50 overflow-y-auto">
            {checkResult.errors.map((err, idx) => (
              <div
                key={idx}
                className="mb-1 border-b border-gray-100 last:border-0 pb-1"
              >
                <div>
                  <strong>Wrong:</strong>{" "}
                  <span className="text-red-500">{err.wrong}</span>
                </div>
                <div>
                  <strong>Suggestion:</strong>{" "}
                  <span className="text-green-600">{err.suggestion}</span>
                </div>
                {err.note && (
                  <div className="text-gray-500 italic">
                    <strong>Note:</strong> {err.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
