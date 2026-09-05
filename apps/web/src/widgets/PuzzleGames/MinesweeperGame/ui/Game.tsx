'use client';

import { useMemo, useState } from 'react';
import { Button, Select } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import {
  SoloGameContainer,
  formatDuration,
  useSoloTimer,
  useSoloPause,
  SoloActionButton,
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
  beginner: 'max-w-xl',
  intermediate: 'max-w-3xl',
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
  const pause = useSoloPause(isRunning, finishedAt);
  const timer = useSoloTimer(isRunning, startedAt ?? 0, pause.isPaused);
  const elapsedSeconds =
    finished?.durationSeconds ??
    (startedAt !== null ? Math.floor(timer.elapsedMs / 1000) : 0);

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
    <div className="flex items-center gap-2 sm:gap-3 px-1">
      <div className="flex items-center rounded-lg border border-rose-500/40 bg-[var(--backgroundHover)] px-2 py-0.5 shadow-inner">
        <span
          data-testid="minesweeper-mines-left"
          className="font-mono text-sm sm:text-base font-black tracking-widest text-red-600 dark:text-red-400 tabular-nums drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
        >
          {formatDigits(minesLeft)}
        </span>
      </div>

      <button
        type="button"
        onClick={newGame}
        aria-label={t('games.minesweeper_v1.hud.newGame')}
        data-testid="minesweeper-face-button"
        className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-amber-400/60 bg-gradient-to-b from-amber-300 to-amber-500 text-base sm:text-lg shadow-md transition-transform active:scale-90"
      >
        {faceIcon}
      </button>

      <div className="flex items-center rounded-lg border border-rose-500/40 bg-[var(--backgroundHover)] px-2 py-0.5 shadow-inner">
        <span
          data-testid="minesweeper-timer"
          className="font-mono text-sm sm:text-base font-black tracking-widest text-red-600 dark:text-red-400 tabular-nums drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
        >
          {formatDigits(elapsedSeconds)}
        </span>
      </div>
    </div>
  );

  const controls = (
    <>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <label
          className="text-xs font-semibold whitespace-nowrap text-[var(--textSecondary)] hidden sm:inline"
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

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setFlagMode((mode) => !mode)}
        aria-pressed={flagMode}
        title={t('games.minesweeper_v1.hud.flagModeHint')}
        className={cx(
          'whitespace-nowrap px-2.5 h-8 text-xs font-semibold rounded-lg transition-colors',
          flagMode
            ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/30 ring-1 ring-rose-500/30'
            : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--primary)]/50',
        )}
      >
        🚩 {t('games.minesweeper_v1.hud.flagMode')}
      </Button>
    </>
  );

  const actions = (
    <>
      {isGameOver && (
        <SoloActionButton
          variant="results"
          dataTestId="minesweeper-show-results-button"
          icon="🏆"
        >
          {t('games.table.analytics.view') || 'Results'}
        </SoloActionButton>
      )}
      <SoloActionButton onClick={newGame} icon="🔄">
        {t('games.minesweeper_v1.hud.newGame')}
      </SoloActionButton>
    </>
  );

  return (
    <SoloGameContainer
      gameId="minesweeper_v1"
      difficulty={game.difficulty}
      sortBy="durationMs"
      order="asc"
      layout="stacked"
      leaderboardDefaultExpanded={true}
      maxWidthClassName={DIFFICULTY_MAX_WIDTH[game.difficulty] ?? 'max-w-3xl'}
      pause={pause}
      isRunning={isRunning}
      startedAt={startedAt ?? 0}
      finishedAt={finishedAt}
      onNewGame={newGame}
      hud={hud}
      controls={controls}
      actions={actions}
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
