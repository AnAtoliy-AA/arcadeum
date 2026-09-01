'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, LoadingState, Select } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { MinesweeperThemeProvider } from '../lib/MinesweeperThemeContext';
import { useMinesweeperStore } from '../store/minesweeperStore';
import type { Difficulty } from '../types';
import { MinesweeperBoard } from './MinesweeperBoard';

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty }> = [
  { value: 'beginner' },
  { value: 'intermediate' },
  { value: 'expert' },
];

export default function MinesweeperGame() {
  useTrackSoloGameStarted('minesweeper_v1');
  return (
    <MinesweeperThemeProvider>
      <MinesweeperTable />
    </MinesweeperThemeProvider>
  );
}

function subscribeNoop(): () => void {
  return () => undefined;
}

function formatDigits(num: number): string {
  const clamped = Math.max(0, Math.min(999, num));
  return String(clamped).padStart(3, '0');
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function MinesweeperTable() {
  const { t } = useTranslation();
  const game = useMinesweeperStore((state) => state.game);
  const finished = useMinesweeperStore((state) => state.finished);
  const startedAt = useMinesweeperStore((state) => state.startedAt);
  const finishedAt = useMinesweeperStore((state) => state.finishedAt);
  const reveal = useMinesweeperStore((state) => state.reveal);
  const flag = useMinesweeperStore((state) => state.flag);
  const changeDifficulty = useMinesweeperStore(
    (state) => state.changeDifficulty,
  );
  const newGame = useMinesweeperStore((state) => state.newGame);

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [flagMode, setFlagMode] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isRunning = mounted && startedAt !== null && finishedAt === null;
  useEffect(() => {
    if (!isRunning || startedAt === null) return undefined;
    const tick = () =>
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const [isDismissed, setIsDismissed] = useState(false);
  const isGameOver = game.status === 'won' || game.status === 'lost';

  const handleCloseModal = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const handleNewGame = useCallback(() => {
    setIsDismissed(false);
    newGame();
  }, [newGame]);

  const handleOpenModal = useCallback(() => {
    setIsDismissed(false);
  }, []);

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      duration:
        finished.durationSeconds !== null
          ? formatDuration(finished.durationSeconds)
          : undefined,
      customStats: [
        {
          id: 'difficulty',
          label: t('games.minesweeper_v1.hud.difficulty'),
          value: t(
            `games.minesweeper_v1.difficulty.${game.difficulty}` as TranslationKey,
          ),
        },
        {
          id: 'mines',
          label: t('games.minesweeper_v1.hud.mines'),
          value: game.mineCount,
        },
      ],
    };
  }, [finished, game.difficulty, game.mineCount, t]);

  if (!mounted) {
    return <LoadingState message={t('games.minesweeper_v1.board.loading')} />;
  }

  const minesLeft = Math.max(game.mineCount - game.flagCount, 0);

  const faceIcon =
    game.status === 'won'
      ? '😎'
      : game.status === 'lost'
        ? '😵'
        : isPressing
          ? '😮'
          : '😄';

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-2">
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 shadow-xl backdrop-blur-md sm:p-4">
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-slate-950 px-3 py-1.5 shadow-inner">
          <span className="font-mono text-xl font-black tracking-widest text-red-500 tabular-nums drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
            {formatDigits(minesLeft)}
          </span>
        </div>

        <button
          type="button"
          onClick={newGame}
          aria-label={t('games.minesweeper_v1.hud.newGame')}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-400/60 bg-gradient-to-b from-amber-300 to-amber-500 text-2xl shadow-lg transition-transform active:scale-90"
        >
          {faceIcon}
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-slate-950 px-3 py-1.5 shadow-inner">
          <span className="font-mono text-xl font-black tracking-widest text-red-500 tabular-nums drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
            {formatDigits(elapsedSeconds)}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <label
            className="text-xs font-semibold text-[var(--textSecondary)]"
            htmlFor="minesweeper-difficulty"
          >
            {t('games.minesweeper_v1.hud.difficulty')}
          </label>
          <Select
            id="minesweeper-difficulty"
            size="sm"
            value={game.difficulty}
            onValueChange={(value) => changeDifficulty(value as Difficulty)}
            options={DIFFICULTY_OPTIONS.map(({ value }) => ({
              value,
              label: t(
                `games.minesweeper_v1.difficulty.${value}` as TranslationKey,
              ),
            }))}
          />
        </div>

        <div className="flex items-center gap-2">
          {isGameOver && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenModal}
              data-testid="minesweeper-show-results-button"
              className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25"
            >
              🏆 {t('games.table.analytics.view') || 'Results'}
            </Button>
          )}
          <Button
            variant={flagMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFlagMode((mode) => !mode)}
            aria-pressed={flagMode}
            title={t('games.minesweeper_v1.hud.flagModeHint')}
          >
            🚩 {t('games.minesweeper_v1.hud.flagMode')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNewGame}>
            {t('games.minesweeper_v1.hud.newGame')}
          </Button>
        </div>
      </div>

      <MinesweeperBoard
        game={game}
        flagMode={flagMode}
        onReveal={reveal}
        onFlag={flag}
        onPressingChange={setIsPressing}
      />

      <GameResultModal
        isOpen={finished !== null && !isDismissed}
        result={finished ? (finished.won ? 'victory' : 'defeat') : null}
        gameName="Minesweeper"
        onRematch={handleNewGame}
        rematchLabel={t('games.minesweeper_v1.result.playAgain')}
        onClose={handleCloseModal}
        t={t}
        messages={{
          title: t(
            finished?.won
              ? 'games.minesweeper_v1.result.wonTitle'
              : 'games.minesweeper_v1.result.lostTitle',
          ),
          message: t(
            finished?.won
              ? 'games.minesweeper_v1.result.wonBody'
              : 'games.minesweeper_v1.result.lostBody',
          ),
        }}
        theme="arcade"
        stats={stats}
      />
    </div>
  );
}
