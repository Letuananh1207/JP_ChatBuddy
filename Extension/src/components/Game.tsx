// Game.tsx
import React from "react";

interface GameProps {
  onChangeMode: () => void;
}

const Game: React.FC<GameProps> = ({ onChangeMode }) => {
  const games = [{ name: "Đoán từ" }];
  return (
    <div className="relative w-full h-full pr-2 py-2 grid grid-cols-2 content-start gap-x-2 gap-y-4 ">
      {games.map((game) => (
        <div
          key={game.name}
          className="text-sm text-center border-2 border-double h-12 flex justify-center items-center bg-[url(/manga_paper_center.png)] bg-cover cursor-pointer"
          onClick={() => {
            onChangeMode();
          }}
        >
          {game.name}
        </div>
      ))}
      <img
        className="absolute w-16 right-0 bottom-1"
        src="./good_emotion.png"
        alt="emotion"
      />
    </div>
  );
};

export default Game;
