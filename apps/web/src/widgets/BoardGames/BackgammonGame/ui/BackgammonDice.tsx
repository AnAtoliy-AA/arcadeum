'use client';

import { AnimatedDice } from '@arcadeum/ui';

interface BackgammonDiceProps {
  rolledDice: [number, number] | null;
  remainingDice: number[];
  canRoll: boolean;
  onRoll: () => void;
  rollLabel: string;
}

export function BackgammonDice({
  rolledDice,
  remainingDice,
  canRoll,
  onRoll,
  rollLabel,
}: BackgammonDiceProps) {
  const isDoubles =
    Boolean(rolledDice) &&
    rolledDice?.[0] === rolledDice?.[1] &&
    (rolledDice?.[0] ?? 0) > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      {isDoubles && rolledDice && (
        <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1 border border-amber-300">
          <span>✨</span>
          <span>
            DOUBLE {rolledDice[0]}s! ({remainingDice.length} left)
          </span>
        </div>
      )}

      <div className="flex flex-row items-center justify-center gap-3">
        {canRoll && (
          <button
            className="px-6 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-md transition-transform duration-150 active:scale-95 hover:brightness-110 text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 ring-2 ring-purple-400/50 hover:ring-purple-300 flex items-center gap-1.5 cursor-pointer"
            data-testid="roll-dice-btn"
            onClick={onRoll}
            type="button"
          >
            <span className="text-sm sm:text-base">🎲</span>
            <span>{rollLabel}</span>
          </button>
        )}

        {remainingDice.length > 0 && (
          <AnimatedDice
            isDoubles={isDoubles}
            size="md"
            values={remainingDice}
          />
        )}
      </div>
    </div>
  );
}
