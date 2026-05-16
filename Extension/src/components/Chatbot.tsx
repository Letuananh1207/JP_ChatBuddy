import { useEffect, useState, type JSX } from "react";
import {
  CheckSquare,
  Mic,
  CornerUpLeft,
  Gamepad2,
  Star,
  Settings,
} from "lucide-react";
import { vocabularyService } from "../services/api";

import CheckTab from "./CheckTab";
import Game from "./Game";
import Home from "./Home";
import GameContent from "./GameContent";
import MarkWord from "./MarkWord";
import Setting from "./Setting";
import AddWordForm from "./AddWordForm";

type TabKey = "home" | "check" | "game" | "mark" | "gameContent" | "setting";

const ChatBot: React.FC = () => {
  const [activeTab, setactiveTab] = useState<TabKey>("home");
  const [showAddForm, setShowAddForm] = useState(false);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [quote, setQuote] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isNewDraft, setIsNewDraft] = useState(false);

  // Trạng thái chờ phản hồi từ API
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartNewConversation = () => {
    setConversationId(null);
    setIsNewDraft(true);
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setIsNewDraft(false);
  };

  const handleConversationCreated = (id: string) => {
    setConversationId(id);
    setIsNewDraft(false);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (!type || !payload) return;

      const text = payload.trim();

      if (type === "TEXT_SELECTED") {
        setWord(text);
        setMeaning("");
        setShowAddForm(true);
      }

      if (type === "EXPLAIN_TEXT") {
        setactiveTab("home");
        setQuote(text);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAddWord = async () => {
    // 1. Validate dữ liệu
    if (!word.trim() || !meaning.trim()) {
      alert("Vui lòng nhập đầy đủ từ và ý nghĩa");
      return;
    }

    // 2. Bắt đầu trạng thái loading
    setIsSubmitting(true);

    try {
      // 3. Gọi API từ service đã tách riêng
      await vocabularyService.addWord(word.trim(), meaning.trim());

      console.log("✅ Thêm từ vựng thành công!");

      // 4. Phản hồi thành công: Reset UI và đóng form
      setWord("");
      setMeaning("");
      setShowAddForm(false);

      // Bạn có thể chuyển sang tab 'mark' để xem từ vừa thêm
      // setactiveTab("mark");
    } catch (err) {
      console.error("❌ Lỗi khi thêm từ:", err);
      alert("Đã xảy ra lỗi khi kết nối server. Vui lòng thử lại!");
    } finally {
      // 5. Kết thúc trạng thái loading (luôn chạy dù thành công hay lỗi)
      setIsSubmitting(false);
    }
  };

  const tabMap: Record<TabKey, { name: string; component: JSX.Element }> = {
    home: {
      name: "Home",
      component: (
        <Home
          quote={quote}
          onDeleteQuote={() => setQuote("")}
          conversationId={conversationId}
          isNewDraft={isNewDraft}
          onStartNewConversation={handleStartNewConversation}
          onSelectConversation={handleSelectConversation}
          onConversationCreated={handleConversationCreated}
        />
      ),
    },
    check: { name: "Nhiệm vụ", component: <CheckTab /> },
    game: {
      name: "Trò chơi",
      component: <Game onChangeMode={() => setactiveTab("gameContent")} />,
    },
    mark: { name: "Đánh dấu", component: <MarkWord /> },
    gameContent: {
      name: "",
      component: <GameContent onBack={() => setactiveTab("game")} />,
    },
    setting: { name: "Cài đặt", component: <Setting /> },
  };

  return (
    <div className="relative h-[280px] w-[300px] flex items-center gap-2 bg-white overflow-hidden shadow-sm font-sans">
      {/* Sidebar */}
      <div className="w-[60px] flex flex-col bg-[url('/manga_paper.png')] items-center bg-gray-50 gap-4 border-r-4 border-double h-full px-3 py-4 shrink-0">
        {activeTab === "home" ? (
          <>
            <Mic
              size={32}
              className="cursor-pointer rounded-full p-1 bg-gray-500 text-white hover:bg-gray-600"
              onClick={handleStartNewConversation}
            />
            <CheckSquare
              size={32}
              className="cursor-pointer rounded-full p-1 bg-white hover:bg-gray-500 hover:text-white border shadow-sm transition-all"
              onClick={() => setactiveTab("check")}
            />
            <Star
              size={32}
              className="cursor-pointer rounded-full p-1 bg-white hover:bg-gray-500 hover:text-white border shadow-sm transition-all"
              onClick={() => setactiveTab("mark")}
            />
            <Gamepad2
              size={32}
              className="cursor-pointer rounded-full p-1 bg-white hover:bg-gray-500 hover:text-white border shadow-sm transition-all"
              onClick={() => setactiveTab("game")}
            />
            <div className="flex-1" />
            <Settings
              size={24}
              className="cursor-pointer rounded-full p-1 bg-white hover:bg-gray-500 hover:text-white border shadow-sm transition-all"
              onClick={() => setactiveTab("setting")}
            />
          </>
        ) : (
          <>
            <CornerUpLeft
              size={32}
              className="cursor-pointer rounded-full p-1 bg-white border shadow-sm hover:bg-gray-100 transition-all"
              onClick={() => setactiveTab("home")}
            />
            <div className="text-center text-[10px] font-bold uppercase text-gray-600 leading-tight">
              {tabMap[activeTab].name}
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="w-[232px] h-full ">{tabMap[activeTab].component}</div>

      {/* ⭐ GLOBAL ADD WORD FORM */}
      <AddWordForm
        open={showAddForm}
        word={word}
        meaning={meaning}
        loading={isSubmitting} // Truyền trạng thái xoay vào form
        onChangeWord={setWord}
        onChangeMeaning={setMeaning}
        onClose={() => !isSubmitting && setShowAddForm(false)} // Ngăn đóng khi đang lưu
        onSubmit={handleAddWord}
      />
    </div>
  );
};

export default ChatBot;
