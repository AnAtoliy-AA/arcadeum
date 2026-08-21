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
  rolledDice: _rolledDice,
  remainingDice,
  canRoll,
  onRoll,
  rollLabel,
}: BackgammonDiceProps) {
  const theme = useBackgammonTheme();

  return (
    <div className="flex flex-row items-center justify-center gap-4 py-2">
      {canRoll && (
        <button
          className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          data-testid="roll-dice-btn"
          onClick={onRoll}
          type="button"
        >
          🎲 {rollLabel}
        </button>
      )}

      {remainingDice.length > 0 && (
        <div className="flex flex-row items-center gap-2">
          {remainingDice.map((val, idx) => (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md relative border transition-transform hover:scale-105"
              key={`die-${idx}-${val}`}
              style={{
                backgroundColor: theme.diceBackground,
                borderColor: theme.diceBorder,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {(DOT_PATTERNS[val] ?? []).map(([cx, cy], dotIdx) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    fill={theme.diceDot}
                    key={dotIdx}
                    r="8"
                  />
                ))}
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
