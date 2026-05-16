import { CornerUpLeft } from "lucide-react";
import WordGame from "./WordGame";

interface GameContentProps {
  onBack: () => void;
}

const GameContent: React.FC<GameContentProps> = ({ onBack }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-stretch">
      {/* Phần nội dung game */}
      <div className="flex-1">
        <WordGame />
      </div>
      <div className="absolute -left-14 top-4">
        <CornerUpLeft
          size={32}
          color="purple"
          className="cursor-pointer border rounded-full p-1 bg-white"
          onClick={onBack}
        />
      </div>
    </div>
  );
};

export default GameContent;
