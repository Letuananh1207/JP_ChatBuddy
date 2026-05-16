// src/hooks/useChatQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, type SendMessagePayload } from "../services/api";

export const useChatQuery = (
  conversationId?: string | null,
  options?: { isNewDraft?: boolean },
) => {
  const queryClient = useQueryClient();
  const isNewDraft = options?.isNewDraft ?? false;

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatService.fetchConversations(10),
  });

  const historyQuery = useQuery({
    queryKey: ["chatHistory", conversationId ?? "latest"],
    queryFn: () =>
      chatService.fetchHistory(10, conversationId ?? undefined),
    enabled: !isNewDraft,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      chatService.sendMessage(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return data;
    },
  });

  return {
    conversationsQuery,
    historyQuery,
    sendMutation,
  };
};
