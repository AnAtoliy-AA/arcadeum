'use client';

import React, { useState } from 'react';
import type { MinigameGuess } from '../types';

interface ArcadePetMinigameProps {
  onComplete: (won: boolean) => void;
  onCancel: () => void;
}

export const ArcadePetMinigame: React.FC<ArcadePetMinigameProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentNumber] = useState<number>(
    () => Math.floor(Math.random() * 7) + 2,
  );
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleGuess = (guess: MinigameGuess) => {
    let nextNum = Math.floor(Math.random() * 9) + 1;
    if (nextNum === currentNumber) {
      nextNum = nextNum === 9 ? 8 : nextNum + 1;
    }
    setRevealedNumber(nextNum);

    const isHigher = nextNum > currentNumber;
    const won =
      (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

    if (won) {
      setResultMessage('You Win! (+Happiness)');
      onComplete(true);
    } else {
      setResultMessage('Oops! Try Again!');
      onComplete(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/60 rounded-lg text-white font-mono gap-3 w-full">
      <div className="text-xs uppercase font-bold tracking-wider text-emerald-400">
        Higher or Lower Game
      </div>

      <div className="flex items-center gap-4 text-2xl font-bold py-2">
        <div className="w-12 h-16 bg-white text-black flex items-center justify-center rounded shadow-inner">
          {currentNumber}
        </div>
        <span className="text-lg text-neutral-400">vs</span>
        <div className="w-12 h-16 bg-neutral-800 text-white border-2 border-dashed border-neutral-500 flex items-center justify-center rounded shadow-inner">
          {revealedNumber !== null ? revealedNumber : '?'}
        </div>
      </div>

      {resultMessage ? (
        <div className="text-sm font-bold text-yellow-300 animate-pulse">
          {resultMessage}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleGuess('higher')}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Higher ▲
          </button>
          <button
            type="button"
            onClick={() => handleGuess('lower')}
            className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Lower ▼
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="text-[11px] text-neutral-400 hover:text-white underline mt-1"
      >
        Exit Game
      </button>
    </div>
  );
};
