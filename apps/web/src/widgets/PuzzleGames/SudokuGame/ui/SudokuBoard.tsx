'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useSudokuTheme } from '../lib/SudokuThemeContext';
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
  const theme = useSudokuTheme();

  const conflicts = new Set(
    Array.from({ length: 81 }, (_, i) => i).flatMap((i) =>
      findConflicts(game.cells, i),
    ),
  );
  const selectedValue =
    selected === null ? 0 : game.cells[selected];

  return (
    <div
      role="grid"
      aria-label="Sudoku"
      className="mx-auto grid aspect-square w-full max-w-[26rem] grid-cols-9 overflow-hidden rounded-xl border-2"
      style={{
        background: theme.boardBackground,
        borderColor: theme.lineThick,
      }}
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

        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-selected={isSelected}
            onClick={() => onSelect(index)}
            className={cx(
              'relative flex items-center justify-center font-semibold transition-colors',
              'border-r border-b',
              col % 3 === 2 && col !== 8 && 'border-r-2',
              row % 3 === 2 && row !== 8 && 'border-b-2',
            )}
            style={{
              borderColor: theme.lineThin,
              background: isSelected
                ? theme.selectedCell
                : isPeer
                  ? theme.peerCell
                  : isSameNumber
                    ? theme.sameNumberCell
                    : 'transparent',
              color: hasConflict
                ? theme.conflictColor
                : isGiven(game, index)
                  ? theme.givenColor
                  : value !== 0
                    ? theme.playerValueColor
                    : undefined,
            }}
          >
            {value !== 0 ? (
              <span
                className={cx(
                  'text-lg sm:text-xl',
                  !isGiven(game, index) && 'font-bold',
                )}
              >
                {value}
              </span>
            ) : (
              <NotesGrid notes={game.notes[index]} color={theme.noteColor} />
            )}
            {notesMode && isSelected && (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0 text-[8px] leading-none opacity-60"
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

function NotesGrid({
  notes,
  color,
}: {
  notes: number[];
  color: string;
}) {
  if (notes.length === 0) return null;
  return (
    <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[1px]">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
        <span
          key={digit}
          className="flex items-center justify-center text-[9px] leading-none sm:text-[10px]"
          style={{ color: notes.includes(digit) ? color : 'transparent' }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}
