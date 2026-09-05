'use client';

import type { CSSProperties } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useSoloFullscreen } from '@/features/games/ui/SoloGameContainer';
import { useSudokuTheme } from '../lib/SudokuThemeContext';
import type { SudokuTheme } from '../lib/theme';
import { colOf, findConflicts, isGiven, rowOf } from '../types';
import type { SudokuState } from '../types';

interface SudokuBoardProps {
  game: SudokuState;
  selected: number | null;
  notesMode: boolean;
  onSelect: (index: number | null) => void;
}

function boardVars(theme: SudokuTheme): CSSProperties {
  return {
    '--sdk-board-bg': theme.boardBackground,
    '--sdk-board-border': theme.boardBorder,
    '--sdk-line-thin': theme.lineThin,
    '--sdk-line-thick': theme.lineThick,
    '--sdk-selected': theme.selectedCell,
    '--sdk-peer': theme.peerCell,
    '--sdk-same': theme.sameNumberCell,
    '--sdk-conflict': theme.conflictColor,
    '--sdk-given': theme.givenColor,
    '--sdk-player-val': theme.playerValueColor,
    '--sdk-note': theme.noteColor,
  } as CSSProperties;
}

export function SudokuBoard({
  game,
  selected,
  notesMode,
  onSelect,
}: SudokuBoardProps) {
  const theme = useSudokuTheme();
  const isFullscreen = useSoloFullscreen();
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
      style={boardVars(theme)}
      className={cx(
        'mx-auto grid aspect-square w-full grid-cols-9 rounded-2xl border-2 border-[var(--sdk-board-border)] bg-black/25 backdrop-blur-[2px] p-1 sm:p-1.5 shadow-2xl select-none transition-all duration-200',
        isFullscreen
          ? 'max-w-[min(94vw,min(calc(100vh-14rem),40rem))]'
          : 'max-w-[min(100vw-1rem,min(48vh,24.5rem))] sm:max-w-[min(100vw-2rem,min(50vh,25.5rem))]',
      )}
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
                ? 'border-r-2 border-r-[var(--sdk-line-thick)]'
                : 'border-r border-r-[var(--sdk-line-thin)]',
              row % 3 === 2 && row !== 8
                ? 'border-b-2 border-b-[var(--sdk-line-thick)]'
                : 'border-b border-b-[var(--sdk-line-thin)]',
              isSelected
                ? 'z-10 bg-[var(--sdk-selected)] ring-2 ring-[var(--primary)] ring-inset'
                : isSameNumber
                  ? 'bg-[var(--sdk-same)] text-[var(--sdk-player-val)]'
                  : isPeer
                    ? 'bg-[var(--sdk-peer)]'
                    : 'bg-white/[0.04] hover:bg-white/10',
              hasConflict &&
                'bg-rose-950/70 text-rose-400 ring-1 ring-rose-500/50',
            )}
          >
            {value !== 0 ? (
              <span
                className={cx(
                  'text-lg sm:text-xl tabular-nums',
                  isFullscreen && 'md:text-2xl lg:text-3xl',
                  hasConflict
                    ? 'font-extrabold text-rose-400'
                    : given
                      ? 'font-bold text-[var(--sdk-given)]'
                      : 'font-extrabold text-[var(--sdk-player-val)]',
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
                className="absolute right-0.5 top-0 text-[9px] leading-none text-[var(--primary)] opacity-80"
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
              ? 'text-[var(--sdk-note)] font-medium'
              : 'text-transparent',
          )}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}
