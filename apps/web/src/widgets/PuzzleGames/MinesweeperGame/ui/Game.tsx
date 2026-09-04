'use client';

import { useMemo, useState } from 'react';
import { Button, Select } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  formatDuration,
} from '@/features/games/ui/SoloGameContainer';
import { useSoloTheme } from '@/features/games/store/soloThemeStore';
import { MinesweeperThemeProvider } from '../lib/MinesweeperThemeContext';
import { useMinesweeperStore } from '../store/minesweeperStore';
import type { Difficulty } from '../types';
import { MinesweeperBoard } from './MinesweeperBoard';

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty }> = [
  { value: 'beginner' },
  { value: 'intermediate' },
  { value: 'expert' },
];

const DIFFICULTY_MAX_WIDTH: Record<Difficulty, string> = {
  beginner: 'max-w-md',
  intermediate: 'max-w-2xl',
  expert: 'max-w-5xl',
};

function formatDigits(num: number): string {
  const clamped = Math.max(0, Math.min(999, num));
  return String(clamped).padStart(3, '0');
}

export default function MinesweeperGame() {
  useTrackSoloGameStarted('minesweeper_v1');
  const { themeId } = useSoloTheme('minesweeper_v1');
  return (
    <MinesweeperThemeProvider variant={themeId}>
      <MinesweeperTable />
    </MinesweeperThemeProvider>
  );
}

function MinesweeperTable() {
  const { t } = useTranslation();
  const { themeId } = useSoloTheme('minesweeper_v1');
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

  const [flagMode, setFlagMode] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const isRunning = startedAt !== null && finishedAt === null;
  const isGameOver = game.status === 'won' || game.status === 'lost';
  const minesLeft = Math.max(game.mineCount - game.flagCount, 0);

  const faceIcon =
    game.status === 'won'
      ? '😎'
      : game.status === 'lost'
        ? '😵'
        : isPressing
          ? '😮'
          : '😄';

  const stats: GameResultStats | null = useMemo(() => {
    if (!finished) return null;
    return {
      duration:
        finished.durationSeconds !== null
          ? formatDuration(finished.durationSeconds * 1000)
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

  const hud = (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-[var(--backgroundHover)] px-3 py-1.5 shadow-inner">
        <span className="font-mono text-xl font-black tracking-widest text-red-600 dark:text-red-400 tabular-nums drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
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

      <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-[var(--backgroundHover)] px-3 py-1.5 shadow-inner">
        <span className="font-mono text-xl font-black tracking-widest text-red-600 dark:text-red-400 tabular-nums drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
          {formatDigits(Math.floor((finished?.durationSeconds ?? 0) || 0))}
        </span>
      </div>
    </>
  );

  const controls = (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
        <label
          className="text-xs font-semibold whitespace-nowrap text-[var(--textSecondary)]"
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

      <div className="flex flex-wrap items-center gap-2">
        {isGameOver && (
          <Button
            variant="secondary"
            size="sm"
            data-testid="minesweeper-show-results-button"
            className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25 whitespace-nowrap px-3"
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
          className="whitespace-nowrap px-3"
        >
          🚩 {t('games.minesweeper_v1.hud.flagMode')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={newGame}
          className="whitespace-nowrap px-3"
        >
          {t('games.minesweeper_v1.hud.newGame')}
        </Button>
      </div>
    </div>
  );

  return (
    <SoloGameContainer
      gameId="minesweeper_v1"
      difficulty={game.difficulty}
      sortBy="durationMs"
      order="asc"
      maxWidthClassName={DIFFICULTY_MAX_WIDTH[game.difficulty] ?? 'max-w-2xl'}
      isRunning={isRunning}
      startedAt={startedAt ?? 0}
      finishedAt={finishedAt}
      onNewGame={newGame}
      hud={hud}
      controls={controls}
      loadingMessage="games.minesweeper_v1.board.loading"
      modal={{
        result: finished ? (finished.won ? 'victory' : 'defeat') : null,
        gameName: 'Minesweeper',
        rematchLabel: t('games.minesweeper_v1.result.playAgain'),
        theme: themeId,
        stats,
        messages: {
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
        },
      }}
    >
      <MinesweeperBoard
        game={game}
        flagMode={flagMode}
        onReveal={reveal}
        onFlag={flag}
        onPressingChange={setIsPressing}
      />
    </SoloGameContainer>
  );
}
