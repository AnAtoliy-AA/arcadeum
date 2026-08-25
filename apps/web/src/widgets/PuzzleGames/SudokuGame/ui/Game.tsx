'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Button, LoadingState, Modal, Select } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { SudokuThemeProvider } from '../lib/SudokuThemeContext';
import { useSudokuStore, type FinishedGameInfo } from '../store/sudokuStore';
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

  // The puzzle is random and persisted, so it can only render after mount —
  // otherwise SSR markup (fresh puzzle on the server) never matches the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);

  // Elapsed timer; only ticks while the game is running.
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

  if (!mounted) {
    return <LoadingState message={t('games.sudoku_v1.board.loading')} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-sm">
          <Stat
            label={t('games.sudoku_v1.hud.mistakes')}
            value={game.mistakes}
          />
          <Stat
            label={t('games.sudoku_v1.hud.time')}
            value={formatDuration(elapsedMs)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={newGame}>
          {t('games.sudoku_v1.hud.newGame')}
        </Button>
      </div>

      <div onKeyDown={handleKeyDown} tabIndex={0} className="outline-none">
        <SudokuBoard
          game={game}
          selected={selected}
          notesMode={notesMode}
          onSelect={setSelected}
        />
      </div>

      {/* Controls: notes toggle + number pad */}
      <div className="flex flex-col items-center gap-3">
        <div className="grid w-full max-w-xs grid-cols-5 gap-2">
          {DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => applyDigit(digit)}
              disabled={selected === null}
              aria-label={
                notesMode
                  ? t('games.sudoku_v1.controls.noteDigit', { digit })
                  : t('games.sudoku_v1.controls.placeDigit', { digit })
              }
              className={cx(
                'rounded-lg border py-2 font-mono text-base font-bold transition-colors',
                'border-[var(--borderColor)] bg-[var(--glassBg)] hover:bg-[var(--primary)]/15',
                'disabled:cursor-not-allowed disabled:opacity-40',
                notesMode && 'text-[var(--primary)]',
              )}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNotesMode((mode) => !mode)}
            aria-pressed={notesMode}
            title={t('games.sudoku_v1.controls.notesHint')}
            className={cx(
              'rounded-lg border py-2 text-sm font-bold transition-colors',
              notesMode
                ? 'border-[var(--primary)] bg-[var(--primary)]/20'
                : 'border-[var(--borderColor)] bg-[var(--glassBg)] hover:bg-[var(--primary)]/10',
            )}
          >
            ✎ {t('games.sudoku_v1.controls.notes')}
          </button>
          <button
            type="button"
            onClick={erase}
            disabled={selected === null}
            className={cx(
              'rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] py-2 text-sm font-bold transition-colors',
              'hover:bg-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            ⌫ {t('games.sudoku_v1.controls.erase')}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs opacity-70" htmlFor="sudoku-difficulty">
            {t('games.sudoku_v1.hud.difficulty')}
          </label>
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
        </div>
      </div>

      <ResultDialog finished={finished} onNewGame={newGame} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="font-mono text-lg font-bold leading-tight">{value}</span>
    </span>
  );
}

function ResultDialog({
  finished,
  onNewGame,
}: {
  finished: FinishedGameInfo | null;
  onNewGame: () => void;
}) {
  const { t } = useTranslation();
  if (!finished) return null;

  return (
    <Modal open onClose={() => undefined}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-black">
          {t('games.sudoku_v1.result.wonTitle')}
        </h2>
        <p className="text-sm opacity-80">
          {finished.mistakes === 0
            ? t('games.sudoku_v1.result.flawlessBody')
            : t('games.sudoku_v1.result.wonBody', {
                mistakes: finished.mistakes,
              })}
        </p>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="opacity-60">{t('games.sudoku_v1.hud.time')}</dt>
            <dd className="font-mono text-lg">
              {formatDuration(finished.durationMs)}
            </dd>
          </div>
          <div>
            <dt className="opacity-60">{t('games.sudoku_v1.hud.mistakes')}</dt>
            <dd className="font-mono text-lg">{finished.mistakes}</dd>
          </div>
        </dl>
        <Button onClick={onNewGame}>
          {t('games.sudoku_v1.result.playAgain')}
        </Button>
      </div>
    </Modal>
  );
}
