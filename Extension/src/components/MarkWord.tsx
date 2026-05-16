import React, { useState, useMemo } from "react";
import {
  Trash2,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useVocabQuery } from "../hooks/useVocabQuery";
import AddWordForm from "./AddWordForm";
import ConfirmDeleteForm from "./ConfirmDeleteForm";

const MarkWord: React.FC = () => {
  const { vocabQuery, addMutation, deleteMutation } = useVocabQuery();

  const [showForm, setShowForm] = useState(false);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [wordToDelete, setWordToDelete] = useState("");

  // States cho Filter và Pagination
  const [filterDays, setFilterDays] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Số lượng từ hiển thị trên mỗi trang

  // 1. Logic lọc dữ liệu theo thời gian
  const filteredVocab = useMemo(() => {
    if (!vocabQuery.data) return [];
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc

    if (filterDays === "all") return vocabQuery.data;

    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - parseInt(filterDays));

    return vocabQuery.data.filter((item: any) => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= limitDate;
    });
  }, [vocabQuery.data, filterDays]);

  // 2. Logic phân trang
  const totalPages = Math.ceil(filteredVocab.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVocab.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVocab, currentPage]);

  const handleAdd = () => {
    if (!word.trim() || !meaning.trim()) return;
    addMutation.mutate(
      { word: word.trim(), meaning: meaning.trim() },
      {
        onSuccess: () => {
          setWord("");
          setMeaning("");
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="relative w-full h-full py-1 pr-2 flex flex-col">
      <AddWordForm
        open={showForm}
        word={word}
        meaning={meaning}
        loading={addMutation.isPending}
        onChangeWord={setWord}
        onChangeMeaning={setMeaning}
        onClose={() => !addMutation.isPending && setShowForm(false)}
        onSubmit={handleAdd}
      />

      <ConfirmDeleteForm
        open={!!deleteId}
        word={wordToDelete}
        loading={deleteMutation.isPending}
        onClose={() => !deleteMutation.isPending && setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <div className="w-full h-full flex flex-col text-sm gap-4 flex-1">
        {/* HEADER & FILTER */}
        <div className="flex items-center gap-2">
          <div className="font-bold border-b-1 border-gray-300">Ghi chép</div>

          <div className="flex items-center ml-auto gap-1 bg-gray-100 rounded px-1 border border-gray-200">
            <Calendar size={10} className="text-gray-500" />
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="text-[10px] bg-transparent outline-none cursor-pointer py-0.5"
            >
              <option value="all">Tất cả</option>
              <option value="3">3 ngày qua</option>
              <option value="7">7 ngày qua</option>
              <option value="30">1 tháng qua</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 w-fit cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* LIST HIỂN THỊ DỮ LIỆU PHÂN TRANG */}
        <div className="flex flex-col gap-3 min-h-[220px]">
          {vocabQuery.isLoading ? (
            <div className="text-center py-4 text-xs text-gray-400 italic">
              Đang tải...
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-gray-400">
              Không có từ vựng nào.
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div
                className="border border-gray-400 flex gap-4 shrink-0 animate-in fade-in duration-300"
                key={item._id}
              >
                <div className="p-1 bg-[url('/manga_paper_center.png')] bg-cover bg-center w-26 truncate font-medium uppercase">
                  {item.word}
                </div>
                <div className="text-xs flex-1 flex items-center capitalize">
                  {item.meaning}
                </div>
                <div
                  className="flex items-center justify-center px-1 border-l cursor-pointer bg-gray-200 hover:bg-red-100 group transition-colors"
                  onClick={() => {
                    setDeleteId(item._id);
                    setWordToDelete(item.word);
                  }}
                >
                  <Trash2
                    size={14}
                    color="gray"
                    className="group-hover:text-red-500"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="mt-auto flex items-center justify-center gap-4 py-2 border-t border-gray-100">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-[10px] font-medium text-gray-500">
              Trang <span className="text-black">{currentPage}</span> /{" "}
              {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkWord;
