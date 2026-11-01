'use client';

import React from 'react';

interface ArcadePetControlsProps {
  onPressA: () => void;
  onPressB: () => void;
  onPressC: () => void;
  isSleeping: boolean;
  isEgg: boolean;
}

export const ArcadePetControls: React.FC<ArcadePetControlsProps> = ({
  onPressA,
  onPressB,
  onPressC,
  isSleeping,
  isEgg,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full pt-4">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            data-testid="arcade-pet-btn-a"
            onClick={onPressA}
            className="w-14 h-14 rounded-full bg-[var(--arcade-btn-a,#ef4444)] border-4 border-black/30 shadow-lg active:translate-y-1 active:shadow-sm flex items-center justify-center font-bold text-white text-lg transition-transform focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Select button A"
          >
            A
          </button>
          <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
            Select
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            data-testid="arcade-pet-btn-b"
            onClick={onPressB}
            className="w-16 h-16 rounded-full bg-[var(--arcade-btn-b,#10b981)] border-4 border-black/30 shadow-lg active:translate-y-1 active:shadow-sm flex items-center justify-center font-bold text-white text-xl transition-transform focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Confirm button B"
          >
            {isEgg ? 'Hatch' : 'B'}
          </button>
          <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
            {isEgg ? 'Hatch' : 'Confirm'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            data-testid="arcade-pet-btn-c"
            onClick={onPressC}
            className="w-14 h-14 rounded-full bg-[var(--arcade-btn-c,#f59e0b)] border-4 border-black/30 shadow-lg active:translate-y-1 active:shadow-sm flex items-center justify-center font-bold text-white text-lg transition-transform focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cancel button C"
          >
            C
          </button>
          <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
            {isSleeping ? 'Wake' : 'Cancel'}
          </span>
        </div>
      </div>
    </div>
  );
};
