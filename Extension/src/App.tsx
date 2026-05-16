import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 1. Import các thành phần cần thiết
import ChatBot from "./components/Chatbot";
import Login from "./components/Login";
import { ModeProvider } from "./context/ModeContext";
import { authService } from "./services/api";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // user state is now handled inside Setting component

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex justify-center items-end">
        <ModeProvider>
          {isAuthenticated ? (
            <ChatBot />
          ) : (
            <Login onSuccess={handleAuthSuccess} />
          )}
        </ModeProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
