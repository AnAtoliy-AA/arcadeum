'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

export interface InteractiveGuideBoardProps {
  id: string;
  title: string;
  prompt: string;
  gameId: 'chess' | 'tic-tac-toe' | 'checkers';
  board: string[];
  solutionIndex: number;
  explanation: string;
  playHref?: string;
}

export function InteractiveGuideBoard({
  id,
  title,
  prompt,
  board: initialBoard,
  solutionIndex,
  explanation,
  playHref,
}: InteractiveGuideBoardProps) {
  const [board, setBoard] = useState<string[]>(initialBoard);
  const [status, setStatus] = useState<'unsolved' | 'correct' | 'incorrect'>(
    'unsolved',
  );

  const handleCellClick = useCallback(
    (index: number) => {
      if (status === 'correct') return;
      if (board[index] !== '') return;

      if (index === solutionIndex) {
        const nextBoard = [...board];
        nextBoard[index] = 'X';
        setBoard(nextBoard);
        setStatus('correct');
      } else {
        setStatus('incorrect');
      }
    },
    [board, solutionIndex, status],
  );

  const handleReset = useCallback(() => {
    setBoard(initialBoard);
    setStatus('unsolved');
  }, [initialBoard]);

  return (
    <div
      id={id}
      data-testid="interactive-guide-board"
      className="my-8 overflow-hidden rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--glassBorder)] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
            <span>⚡</span> Interactive Challenge
          </span>
          <h3 className="mt-1.5 text-lg font-bold text-[var(--accent)]">
            {title}
          </h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted,rgba(255,255,255,0.7))]">
          {prompt}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div
          aria-label={title}
          className="grid grid-cols-3 gap-2 rounded-xl bg-black/30 p-3 shadow-inner"
        >
          {board.map((cell, idx) => {
            const isClickable = status !== 'correct' && cell === '';
            const isCorrectTarget =
              status === 'correct' && idx === solutionIndex;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Square ${idx + 1}: ${cell || 'empty'}`}
                disabled={!isClickable}
                onClick={() => handleCellClick(idx)}
                data-testid={`puzzle-cell-${idx}`}
                className={cx(
                  'flex h-20 w-20 items-center justify-center rounded-lg text-2xl font-bold transition-all duration-200',
                  'border border-[var(--glassBorder)]',
                  cell === ''
                    ? 'bg-white/5 hover:bg-white/15 hover:border-[var(--primary)] cursor-pointer'
                    : 'bg-white/10 cursor-default select-none',
                  isCorrectTarget &&
                    'border-[var(--success,#22c55e)] bg-[var(--success,#22c55e)]/20 text-[var(--success,#22c55e)] animate-pulse',
                  cell === 'X' && 'text-[var(--primary)]',
                  cell === 'O' && 'text-red-400',
                )}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {status === 'correct' && (
          <div
            data-testid="puzzle-feedback-correct"
            className="mt-5 w-full rounded-xl border border-[var(--success,#22c55e)]/40 bg-[var(--success,#22c55e)]/10 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-base font-bold text-[var(--success,#22c55e)]">
              <span>🎉</span> Correct Move!
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted,rgba(255,255,255,0.85))]">
              {explanation}
            </p>
            {playHref && (
              <div className="mt-3 flex justify-center">
                <Link href={playHref}>
                  <Button variant="primary" size="sm">
                    Play Full Game Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {status === 'incorrect' && (
          <div
            data-testid="puzzle-feedback-incorrect"
            className="mt-5 w-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center"
          >
            <div className="text-base font-bold text-red-400">
              Not quite! That leaves an opening.
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted,rgba(255,255,255,0.75))]">
              Review the board threats and try again.
            </p>
            <div className="mt-3 flex justify-center">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
