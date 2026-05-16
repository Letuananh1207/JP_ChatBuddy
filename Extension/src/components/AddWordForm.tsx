import { X, Loader2 } from "lucide-react";

type AddWordFormProps = {
  open: boolean;
  word: string;
  meaning: string;
  loading?: boolean; // Thêm prop để biết đang gửi dữ liệu
  onChangeWord: (value: string) => void;
  onChangeMeaning: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const AddWordForm: React.FC<AddWordFormProps> = ({
  open,
  word,
  meaning,
  loading = false, // Mặc định là false
  onChangeWord,
  onChangeMeaning,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-gray-100 border border-gray-400 p-3 w-56 text-[11px] flex flex-col gap-2 shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b border-gray-300 pb-1">
          <span className="font-bold uppercase text-gray-600">Lưu từ vựng</span>
          <X
            size={14}
            className={`cursor-pointer hover:text-red-500 ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={onClose}
          />
        </div>

        <input
          className="border p-1 bg-white outline-none focus:border-gray-500"
          placeholder="Word"
          value={word}
          disabled={loading}
          onChange={(e) => onChangeWord(e.target.value)}
        />

        <input
          className="border p-1 bg-white outline-none focus:border-gray-500"
          placeholder="Meaning"
          value={meaning}
          autoFocus
          disabled={loading}
          onChange={(e) => onChangeMeaning(e.target.value)}
        />

        <button
          onClick={onSubmit}
          disabled={loading || !word.trim() || !meaning.trim()}
          className="bg-gray-800 text-white hover:bg-black p-1.5 font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Thêm vào sổ tay"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddWordForm;
