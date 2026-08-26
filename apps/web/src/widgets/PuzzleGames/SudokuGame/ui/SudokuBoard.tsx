'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { colOf, findConflicts, isGiven, rowOf } from '../types';
import type { SudokuState } from '../types';

interface SudokuBoardProps {
  game: SudokuState;
  selected: number | null;
  notesMode: boolean;
  onSelect: (index: number | null) => void;
}

export function SudokuBoard({
  game,
  selected,
  notesMode,
  onSelect,
}: SudokuBoardProps) {
  const conflicts = new Set(
    Array.from({ length: 81 }, (_, i) => i).flatMap((i) =>
      findConflicts(game.cells, i),
    ),
  );
  const selectedValue = selected === null ? 0 : game.cells[selected];

  return (
    <div
      role="grid"
      aria-label="Sudoku"
      className="mx-auto grid aspect-square w-full max-w-[28rem] grid-cols-9 rounded-2xl border-2 border-sky-500/30 bg-slate-950/90 p-1 shadow-2xl shadow-black/70 select-none"
    >
      {game.cells.map((value, index) => {
        const row = rowOf(index);
        const col = colOf(index);
        const isSelected = selected === index;
        const isPeer =
          !isSelected &&
          selected !== null &&
          (rowOf(selected) === row ||
            colOf(selected) === col ||
            boxIdOf(selected) === boxIdOf(index));
        const isSameNumber =
          value !== 0 && selectedValue !== 0 && value === selectedValue;
        const hasConflict = conflicts.has(index);
        const given = isGiven(game, index);

        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-selected={isSelected}
            onClick={() => onSelect(index)}
            className={cx(
              'relative flex items-center justify-center font-mono transition-colors',
              col % 3 === 2 && col !== 8
                ? 'border-r-2 border-r-sky-500/40'
                : 'border-r border-r-slate-800/80',
              row % 3 === 2 && row !== 8
                ? 'border-b-2 border-b-sky-500/40'
                : 'border-b border-b-slate-800/80',
              isSelected
                ? 'z-10 bg-sky-500/30 ring-2 ring-sky-400 ring-inset'
                : isSameNumber
                  ? 'bg-sky-400/20 text-sky-200'
                  : isPeer
                    ? 'bg-sky-950/30'
                    : 'bg-transparent hover:bg-slate-800/40',
              hasConflict &&
                'bg-red-950/70 text-red-400 ring-1 ring-red-500/50',
            )}
          >
            {value !== 0 ? (
              <span
                className={cx(
                  'text-lg sm:text-xl tabular-nums',
                  given
                    ? 'font-bold text-slate-100'
                    : 'font-extrabold text-sky-400',
                  hasConflict && 'text-red-400',
                )}
              >
                {value}
              </span>
            ) : (
              <NotesGrid notes={game.notes[index]} />
            )}
            {notesMode && isSelected && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0 text-[9px] leading-none text-sky-300 opacity-80"
              >
                ✎
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function boxIdOf(index: number): number {
  const boxRow = Math.floor(rowOf(index) / 3);
  const boxCol = Math.floor(colOf(index) / 3);
  return boxRow * 3 + boxCol;
}

function NotesGrid({ notes }: { notes: number[] }) {
  if (notes.length === 0) return null;
  return (
    <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[1px]">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
        <span
          key={digit}
          className={cx(
            'flex items-center justify-center font-mono text-[9px] leading-none sm:text-[10px]',
            notes.includes(digit)
              ? 'text-sky-300/90 font-medium'
              : 'text-transparent',
          )}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}
