import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 1. Import các thành phần cần thiết
import ChatBot from "./components/Chatbot";
import { ModeProvider } from "./context/ModeContext";

// 2. Khởi tạo QueryClient bên ngoài Component để tránh khởi tạo lại khi re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tùy chọn: Không tự động load lại khi chuyển tab trình duyệt
      retry: 1, // Thử lại 1 lần nếu gọi API lỗi
    },
  },
});

function App() {
  return (
    // 3. Bao bọc toàn bộ ứng dụng bằng QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex justify-center items-end">
        <ModeProvider>
          <ChatBot />
        </ModeProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
