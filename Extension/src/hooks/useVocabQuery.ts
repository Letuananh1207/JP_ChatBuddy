import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vocabularyService } from "../services/api";

export const useVocabQuery = () => {
  const queryClient = useQueryClient();

  // 1. Hook lấy danh sách
  const vocabQuery = useQuery({
    queryKey: ["vocabularies"],
    queryFn: vocabularyService.getAll,
  });

  // 2. Hook thêm từ
  const addMutation = useMutation({
    mutationFn: ({ word, meaning }: { word: string; meaning: string }) =>
      vocabularyService.addWord(word, meaning),
    onSuccess: () => {
      // Làm mới danh sách khi thêm thành công
      queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
    },
  });

  // 3. Hook xóa từ
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vocabularyService.deleteWord(id),
    onSuccess: () => {
      // Làm mới danh sách khi xóa thành công
      queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
    },
  });

  return {
    vocabQuery,
    addMutation,
    deleteMutation,
  };
};
