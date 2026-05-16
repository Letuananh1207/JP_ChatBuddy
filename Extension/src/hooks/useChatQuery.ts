// src/hooks/useChatQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, type SendMessagePayload } from "../services/api";

export const useChatQuery = () => {
  const queryClient = useQueryClient();

  // 1. Lấy lịch sử (mặc định lấy 10 cặp = 20 tin nhắn)
  const historyQuery = useQuery({
    queryKey: ["chatHistory"],
    queryFn: () => chatService.fetchHistory(10),
  });

  // 2. Gửi tin nhắn (Payload giờ đây khớp hoàn toàn với chatService.sendMessage)
  const sendMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      chatService.sendMessage(payload),
    onSuccess: () => {
      // Refresh lại danh sách tin nhắn ngay khi Konny vừa đáp
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });

  return {
    historyQuery,
    sendMutation,
  };
};
