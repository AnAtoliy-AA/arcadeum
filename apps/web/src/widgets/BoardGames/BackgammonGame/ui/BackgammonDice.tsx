'use client';

import { useBackgammonTheme } from '../lib/BackgammonThemeContext';

interface BackgammonDiceProps {
  rolledDice: [number, number] | null;
  remainingDice: number[];
  canRoll: boolean;
  onRoll: () => void;
  rollLabel: string;
}

const DOT_PATTERNS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 28],
    [72, 28],
    [28, 50],
    [72, 50],
    [28, 72],
    [72, 72],
  ],
};

export function BackgammonDice({
  rolledDice,
  remainingDice,
  canRoll,
  onRoll,
  rollLabel,
}: BackgammonDiceProps) {
  const theme = useBackgammonTheme();
  const isDoubles =
    rolledDice && rolledDice[0] === rolledDice[1] && rolledDice[0] > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      {isDoubles && (
        <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-lg animate-pulse flex items-center gap-1 border border-amber-300">
          <span>✨</span>
          <span>
            DOUBLE {rolledDice[0]}s! ({remainingDice.length} left)
          </span>
        </div>
      )}

      <div className="flex flex-row items-center justify-center gap-3">
        {canRoll && (
          <button
            className="px-6 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-2xl transition-all duration-200 active:scale-95 text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 ring-2 ring-purple-400/50 hover:ring-purple-300 shadow-purple-500/40 animate-pulse flex items-center gap-1.5"
            data-testid="roll-dice-btn"
            onClick={onRoll}
            type="button"
          >
            <span className="text-sm sm:text-base">🎲</span>
            <span>{rollLabel}</span>
          </button>
        )}

        {remainingDice.length > 0 && (
          <div className="flex flex-row items-center gap-2">
            {remainingDice.map((val, idx) => (
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-2xl relative border-2 transition-all duration-200 hover:scale-110 active:scale-95 bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-md"
                key={`die-${idx}-${val}`}
                style={{
                  backgroundColor: theme.diceBackground,
                  borderColor: isDoubles ? '#fbbf24' : theme.diceBorder,
                  boxShadow: isDoubles
                    ? '0 0 12px rgba(251,191,36,0.5)'
                    : '0 4px 10px rgba(0,0,0,0.5)',
                }}
              >
                <svg className="w-full h-full p-1" viewBox="0 0 100 100">
                  {(DOT_PATTERNS[val] ?? []).map(([cx, cy], dotIdx) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      fill={isDoubles ? '#fbbf24' : theme.diceDot}
                      key={dotIdx}
                      r="9.5"
                    />
                  ))}
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
