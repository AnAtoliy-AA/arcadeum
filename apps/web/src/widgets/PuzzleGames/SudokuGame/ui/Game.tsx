'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, LoadingState, Select } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { SudokuThemeProvider } from '../lib/SudokuThemeContext';
import { useSudokuStore } from '../store/sudokuStore';
import type { Difficulty } from '../types';
import { SudokuBoard } from './SudokuBoard';

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty }> = [
  { value: 'easy' },
  { value: 'medium' },
  { value: 'hard' },
];

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SudokuGame() {
  useTrackSoloGameStarted('sudoku_v1');
  return (
    <SudokuThemeProvider>
      <SudokuTable />
    </SudokuThemeProvider>
  );
}

function subscribeNoop(): () => void {
  return () => undefined;
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function SudokuTable() {
  const { t } = useTranslation();
  const game = useSudokuStore((state) => state.game);
  const finished = useSudokuStore((state) => state.finished);
  const startedAt = useSudokuStore((state) => state.startedAt);
  const setCell = useSudokuStore((state) => state.setCell);
  const note = useSudokuStore((state) => state.note);
  const changeDifficulty = useSudokuStore((state) => state.changeDifficulty);
  const newGame = useSudokuStore((state) => state.newGame);

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const isRunning = mounted && finished === null;
  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      1000,
    );
    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const digitCounts = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };
    for (const cell of game.cells) {
      if (cell >= 1 && cell <= 9) {
        counts[cell] = (counts[cell] ?? 0) + 1;
      }
    }
    return counts;
  }, [game.cells]);

  const applyDigit = useCallback(
    (digit: number) => {
      if (selected === null) return;
      if (notesMode) note(selected, digit);
      else setCell(selected, digit);
    },
    [selected, notesMode, note, setCell],
  );

  const erase = useCallback(() => {
    if (selected === null) return;
    setCell(selected, 0);
  }, [selected, setCell]);

  const moveSelection = useCallback((deltaRow: number, deltaCol: number) => {
    setSelected((current) => {
      const base = current ?? 0;
      const row = Math.min(Math.max(Math.floor(base / 9) + deltaRow, 0), 8);
      const col = Math.min(Math.max((base % 9) + deltaCol, 0), 8);
      return row * 9 + col;
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveSelection(-1, 0);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveSelection(1, 0);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveSelection(0, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveSelection(0, 1);
          break;
        case 'Backspace':
          event.preventDefault();
          erase();
          break;
        case 'Delete':
          event.preventDefault();
          erase();
          break;
        case 'n':
        case 'N':
          setNotesMode((mode) => !mode);
          break;
        default: {
          const digit = Number(event.key);
          if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
            applyDigit(digit);
          }
        }
      }
    },
    [applyDigit, erase, moveSelection],
  );

  const handleCloseModal = useCallback(() => {
    useSudokuStore.setState({ finished: null });
  }, []);

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      duration: formatDuration(finished.durationMs),
      customStats: [
        {
          id: 'mistakes',
          label: t('games.sudoku_v1.hud.mistakes'),
          value: finished.mistakes,
        },
        {
          id: 'difficulty',
          label: t('games.sudoku_v1.hud.difficulty'),
          value: t(
            `games.sudoku_v1.difficulty.${game.difficulty}` as TranslationKey,
          ),
        },
      ],
    };
  }, [finished, game.difficulty, t]);

  if (!mounted) {
    return <LoadingState message={t('games.sudoku_v1.board.loading')} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-3">
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-sky-500/20 bg-slate-950/70 p-3 shadow-xl shadow-black/50 backdrop-blur-md sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <StatCard
            label={t('games.sudoku_v1.hud.mistakes')}
            value={game.mistakes}
            highlight={game.mistakes > 0}
          />
          <StatCard
            label={t('games.sudoku_v1.hud.time')}
            value={formatDuration(elapsedMs)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            id="sudoku-difficulty"
            size="sm"
            value={game.difficulty}
            onValueChange={(value) => changeDifficulty(value as Difficulty)}
            options={DIFFICULTY_OPTIONS.map(({ value }) => ({
              value,
              label: t(`games.sudoku_v1.difficulty.${value}` as TranslationKey),
            }))}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={newGame}
            data-testid="sudoku-new-game-button"
          >
            {t('games.sudoku_v1.hud.newGame')}
          </Button>
        </div>
      </div>

      <div
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="w-full outline-none"
      >
        <SudokuBoard
          game={game}
          selected={selected}
          notesMode={notesMode}
          onSelect={setSelected}
        />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <div className="grid w-full grid-cols-9 gap-1.5 sm:gap-2">
          {DIGITS.map((digit) => {
            const count = digitCounts[digit] ?? 0;
            const remaining = Math.max(9 - count, 0);
            const isCompleted = remaining === 0;

            return (
              <button
                key={digit}
                type="button"
                onClick={() => applyDigit(digit)}
                disabled={selected === null || isCompleted}
                aria-label={
                  notesMode
                    ? t('games.sudoku_v1.controls.noteDigit', { digit })
                    : t('games.sudoku_v1.controls.placeDigit', { digit })
                }
                className={cx(
                  'flex flex-col items-center justify-center rounded-xl border py-2 font-mono transition-all',
                  isCompleted
                    ? 'border-dashed border-slate-800 bg-slate-900/30 opacity-30 cursor-not-allowed'
                    : notesMode
                      ? 'border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-500/20 active:scale-95'
                      : 'border-slate-800 bg-slate-900/80 text-white hover:border-sky-500/40 hover:bg-slate-800 active:scale-95',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                <span className="text-base font-extrabold sm:text-lg">
                  {digit}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {remaining}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setNotesMode((mode) => !mode)}
            aria-pressed={notesMode}
            title={t('games.sudoku_v1.controls.notesHint')}
            className={cx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition-all',
              notesMode
                ? 'border-sky-400 bg-sky-500/25 text-sky-200 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
                : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800',
            )}
          >
            <span>✎</span>
            <span>{t('games.sudoku_v1.controls.notes')}</span>
          </button>

          <button
            type="button"
            onClick={erase}
            disabled={selected === null}
            className={cx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-300 transition-all',
              'hover:border-red-500/40 hover:bg-red-950/30 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            <span>⌫</span>
            <span>{t('games.sudoku_v1.controls.erase')}</span>
          </button>
        </div>
      </div>

      <GameResultModal
        isOpen={finished !== null}
        result="victory"
        gameName="Sudoku"
        onRematch={newGame}
        rematchLabel={t('games.sudoku_v1.result.playAgain')}
        onClose={handleCloseModal}
        t={t}
        messages={{
          title: t('games.sudoku_v1.result.wonTitle'),
          message:
            finished?.mistakes === 0
              ? t('games.sudoku_v1.result.flawlessBody')
              : t('games.sudoku_v1.result.wonBody', {
                  mistakes: finished?.mistakes ?? 0,
                }),
        }}
        theme="cyberpunk"
        stats={stats}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2',
        highlight
          ? 'border-red-500/30 bg-red-950/40 text-red-300'
          : 'border-white/5 bg-black/40 text-white',
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="font-mono text-base font-extrabold tabular-nums sm:text-lg">
        {value}
      </span>
    </div>
  );
}
