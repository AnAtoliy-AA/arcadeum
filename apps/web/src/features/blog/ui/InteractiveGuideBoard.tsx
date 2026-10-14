'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button, PracticeDrillBoard } from '@arcadeum/ui';
import type { PracticeDrillGameId } from '@arcadeum/ui';
import type { Locale } from '@/shared/i18n';
import { DEFAULT_LOCALE } from '@/shared/i18n';
import { BLOG_LABELS } from '../labels';

export interface InteractiveGuideBoardProps {
  id: string;
  title: string;
  prompt: string;
  gameId: PracticeDrillGameId;
  board?: string[];
  grid?: string[];
  colLabels?: string[];
  rowLabels?: string[];
  solutionIndex: number | number[];
  solutionValue?: string;
  explanation: string;
  playHref?: string;
  locale?: Locale;
}

function getDefaultSolutionValue(gameId: PracticeDrillGameId): string {
  switch (gameId) {
    case 'chess':
      return 'Q';
    case 'checkers':
      return 'w';
    case 'sea-battle':
      return 'H';
    case 'minesweeper':
      return 'S';
    case 'sudoku':
      return '1';
    case 'go':
      return 'B';
    case 'tic-tac-toe':
    default:
      return 'X';
  }
}

function buildInitialGrid(
  gameId: PracticeDrillGameId,
  board?: string[],
  grid?: string[],
): string[] {
  if (grid && grid.length > 0) {
    return grid;
  }
  if (!board || board.length === 0) {
    return ['...', '...', '...'];
  }
  const width =
    gameId === 'tic-tac-toe'
      ? 3
      : gameId === 'chess' || gameId === 'checkers'
        ? 8
        : Math.round(Math.sqrt(board.length)) || 3;

  const rows: string[] = [];
  for (let i = 0; i < board.length; i += width) {
    const chunk = board.slice(i, i + width);
    rows.push(chunk.map((c) => (c === '' ? '.' : c)).join(''));
  }
  return rows;
}

export function InteractiveGuideBoard({
  id,
  title,
  prompt,
  gameId,
  board,
  grid,
  colLabels,
  rowLabels,
  solutionIndex,
  solutionValue,
  explanation,
  playHref,
  locale = DEFAULT_LOCALE,
}: InteractiveGuideBoardProps) {
  const labels = BLOG_LABELS[locale] ?? BLOG_LABELS.en;
  const initialGrid = useMemo(
    () => buildInitialGrid(gameId, board, grid),
    [gameId, board, grid],
  );

  const [currentGrid, setCurrentGrid] = useState<string[]>(initialGrid);
  const [solvedIndex, setSolvedIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'unsolved' | 'correct' | 'incorrect'>(
    'unsolved',
  );

  const handleCellClick = useCallback(
    (cellIndex: number, r: number, c: number) => {
      if (status === 'correct') {
        return;
      }

      const isSolution = Array.isArray(solutionIndex)
        ? solutionIndex.includes(cellIndex)
        : cellIndex === solutionIndex;

      if (isSolution) {
        const charToPlace = solutionValue ?? getDefaultSolutionValue(gameId);
        const nextGrid = currentGrid.map((rowStr, rowIdx) => {
          if (rowIdx !== r) return rowStr;
          const chars = rowStr.split('');
          chars[c] = charToPlace;
          return chars.join('');
        });
        setCurrentGrid(nextGrid);
        setSolvedIndex(cellIndex);
        setWrongIndex(null);
        setStatus('correct');
      } else {
        setWrongIndex(cellIndex);
        setStatus('incorrect');
      }
    },
    [currentGrid, gameId, solutionIndex, solutionValue, status],
  );

  const handleReset = useCallback(() => {
    setCurrentGrid(initialGrid);
    setSolvedIndex(null);
    setWrongIndex(null);
    setStatus('unsolved');
  }, [initialGrid]);

  return (
    <div
      id={id}
      data-testid="interactive-guide-board"
      className="my-8 overflow-hidden rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] p-4 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col items-center"
    >
      <div className="w-full mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--glassBorder)] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
            <span>⚡</span> {labels.interactiveChallenge}
          </span>
          <h3 className="mt-1.5 text-lg font-bold text-[var(--accent)]">
            {title}
          </h3>
        </div>
        <p className="text-sm text-[var(--colorMuted)] max-w-md">{prompt}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-2 w-full">
        <PracticeDrillBoard
          gameId={gameId}
          grid={currentGrid}
          colLabels={colLabels}
          rowLabels={rowLabels}
          solvedIndex={solvedIndex}
          wrongIndex={wrongIndex}
          disabled={status === 'correct'}
          onCellClick={handleCellClick}
        />

        {status === 'correct' && (
          <div
            data-testid="puzzle-feedback-correct"
            className="mt-5 w-full max-w-xl rounded-xl border border-[var(--success,#22c55e)]/40 bg-[var(--success,#22c55e)]/10 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-base font-bold text-[var(--success,#22c55e)]">
              <span>🎉</span> {labels.correctMove}
            </div>
            <p className="mt-1 text-sm text-[var(--colorMuted)]">
              {explanation}
            </p>
            {playHref && (
              <div className="mt-3 flex justify-center">
                <Link href={playHref}>
                  <Button variant="primary" size="sm">
                    {labels.playFullGame}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {status === 'incorrect' && (
          <div
            data-testid="puzzle-feedback-incorrect"
            className="mt-5 w-full max-w-xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center"
          >
            <div className="text-base font-bold text-red-400">
              {labels.incorrectMove}
            </div>
            <p className="mt-1 text-sm text-[var(--colorMuted)]">
              {labels.incorrectHint}
            </p>
            <div className="mt-3 flex justify-center">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                {labels.tryAgain}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
