import React from "react";
import { Loader2 } from "lucide-react";

type ConfirmDeleteFormProps = {
  open: boolean;
  word: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDeleteForm: React.FC<ConfirmDeleteFormProps> = ({
  open,
  word,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white border border-gray-400 p-4 w-56 text-[11px] flex flex-col gap-3 shadow-xl animate-in fade-in zoom-in duration-200">
        <p className="text-center text-gray-700">
          Bạn có chắc chắn muốn xóa từ{" "}
          <span className="font-bold">"{word}"</span>?
        </p>

        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 border border-gray-300 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-1 hover:bg-red-600 flex items-center justify-center gap-1 disabled:bg-red-300"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteForm;
