'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

type BoardState = Array<Array<string | null>>;

const PUZZLE_START_BOARD: BoardState = [
  ['r', null, null, null, 'r', null, 'k', null],
  ['p', 'p', 'p', null, null, 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, 'Q', null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', null, null, 'P', 'P', 'P'],
  [null, null, null, 'R', null, null, null, 'K'],
];

const PUZZLE_SOLVED_BOARD: BoardState = [
  ['r', null, null, null, 'r', null, 'k', null],
  ['p', 'p', 'p', null, null, 'Q', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', null, null, 'P', 'P', 'P'],
  [null, null, null, 'R', null, null, null, 'K'],
];

const PIECE_NAMES: Record<string, string> = {
  K: 'White King',
  Q: 'White Queen',
  R: 'White Rook',
  B: 'White Bishop',
  N: 'White Knight',
  P: 'White Pawn',
  k: 'Black King',
  q: 'Black Queen',
  r: 'Black Rook',
  b: 'Black Bishop',
  n: 'Black Knight',
  p: 'Black Pawn',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function squareName(rowIdx: number, colIdx: number): string {
  return `${FILES[colIdx]}${8 - rowIdx}`;
}

const PIECE_GLYPHS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

interface ChessPuzzleTeaserProps {
  dailyPuzzleHref: string;
  puzzleRushHref: string;
}

export function ChessPuzzleTeaser({
  dailyPuzzleHref,
  puzzleRushHref,
}: ChessPuzzleTeaserProps) {
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSolve = () => {
    setIsSolved(true);
  };

  const handleReset = () => {
    setIsSolved(false);
    setShowHint(false);
  };

  const currentBoard = isSolved ? PUZZLE_SOLVED_BOARD : PUZZLE_START_BOARD;

  return (
    <section
      data-testid="chess-puzzle-teaser"
      className="relative overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 sm:p-8 backdrop-blur-md"
    >
      <header className="mb-6 flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
          Tactics of the Day
        </span>
        <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Solve the Daily Chess Puzzle
        </h2>
        <p className="m-0 text-sm text-[var(--foreground)] opacity-95 max-w-2xl">
          Test your tactical sharpness. White to move: find the devastating
          decisive sequence.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex flex-col items-center">
          <div
            aria-label="Puzzle Chess Board"
            className="box-border w-full max-w-[360px] mx-auto aspect-square p-2.5 rounded-2xl border-2 border-amber-500/40 shadow-2xl grid grid-cols-8 grid-rows-8 gap-0.5 bg-amber-950/80 transition-all"
          >
            {currentBoard.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const isSolutionTarget = rowIdx === 1 && colIdx === 5;

                return (
                  <button
                    type="button"
                    key={`${rowIdx}-${colIdx}`}
                    aria-label={
                      cell
                        ? `${squareName(rowIdx, colIdx)} ${PIECE_NAMES[cell] ?? cell}`
                        : `${squareName(rowIdx, colIdx)} empty`
                    }
                    onClick={
                      isSolutionTarget && !isSolved ? handleSolve : undefined
                    }
                    className={cx(
                      'box-border flex items-center justify-center rounded-sm text-xl font-bold select-none relative transition-colors duration-200',
                      isLight
                        ? 'bg-[#f0d9b5] text-stone-900'
                        : 'bg-[#b58863] text-stone-900',
                      isSolved &&
                        isSolutionTarget &&
                        'bg-[#cdd26a] ring-2 ring-emerald-500',
                      showHint &&
                        isSolutionTarget &&
                        'cursor-pointer ring-2 ring-amber-500 ring-inset animate-pulse',
                    )}
                  >
                    {cell ? PIECE_GLYPHS[cell] : ''}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-bold text-[var(--color)]">
              White to Move
            </span>
            <span className="rounded-full bg-[var(--surfaceBackground)] px-3 py-1 text-xs font-medium text-[var(--foreground)] opacity-95">
              Rating: 1750
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[var(--borderColor)] bg-[var(--surfaceBackground)]/40 p-4">
            {isSolved ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-[var(--success,#22c55e)]">
                  Brilliant!! 1. Qxf7+!
                </span>
                <p className="m-0 text-xs text-[var(--foreground)] opacity-95 leading-relaxed">
                  Queen penetrates the vulnerable f7 square with check,
                  deflecting the black king or forcing checkmate with the
                  back-rank rook invasion!
                </p>
              </div>
            ) : showHint ? (
              <p className="m-0 text-xs text-[var(--foreground)] opacity-95 leading-relaxed">
                Hint: Look at the weak f7 pawn protected only by the black king,
                and your rook controlling the d-file!
              </p>
            ) : (
              <p className="m-0 text-xs text-[var(--foreground)] opacity-95 leading-relaxed">
                Click on the winning square (f7) or use the buttons below to
                test your solution.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {!isSolved ? (
              <>
                <Button variant="primary" size="sm" onClick={handleSolve}>
                  Solve Move (1. Qxf7+)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Reset Puzzle
              </Button>
            )}

            <Link href={dailyPuzzleHref} className="inline-flex">
              <Button variant="primary" size="sm">
                Daily Puzzle ➔
              </Button>
            </Link>

            <Link href={puzzleRushHref} className="inline-flex">
              <Button variant="victory" size="sm">
                Puzzle Rush ➔
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
