'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, LoadingState, Modal, Select } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { useTrackSoloGameStarted } from '@/shared/analytics/useTrackSoloGameStarted';
import { MinesweeperThemeProvider } from '../lib/MinesweeperThemeContext';
import {
  useMinesweeperStore,
  type FinishedGameInfo,
} from '../store/minesweeperStore';
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

  // The board is random and persisted, so it can only render after mount —
  // otherwise SSR markup (fresh game on the server) never matches the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const [flagMode, setFlagMode] = useState(false);

  // Live timer; ticks between the first reveal and the end of the game.
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

  if (!mounted) {
    return <LoadingState message={t('games.minesweeper_v1.board.loading')} />;
  }

  const minesLeft = Math.max(game.mineCount - game.flagCount, 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-sm">
          <Stat
            label={t('games.minesweeper_v1.hud.mines')}
            value={`🚩 ${minesLeft}`}
          />
          <Stat
            label={t('games.minesweeper_v1.hud.time')}
            value={formatDuration(elapsedSeconds)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={flagMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFlagMode((mode) => !mode)}
            aria-pressed={flagMode}
            title={t('games.minesweeper_v1.hud.flagModeHint')}
          >
            🚩 {t('games.minesweeper_v1.hud.flagMode')}
          </Button>
          <Button variant="outline" size="sm" onClick={newGame}>
            {t('games.minesweeper_v1.hud.newGame')}
          </Button>
        </div>
      </div>

      <MinesweeperBoard
        game={game}
        flagMode={flagMode}
        onReveal={reveal}
        onFlag={flag}
      />

      <div className="flex items-center justify-center gap-3">
        <label className="text-xs opacity-70" htmlFor="minesweeper-difficulty">
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

  const titleKey = finished.won
    ? 'games.minesweeper_v1.result.wonTitle'
    : 'games.minesweeper_v1.result.lostTitle';

  return (
    <Modal open onClose={() => undefined}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-black">{t(titleKey)}</h2>
        <p className="text-sm opacity-80">
          {t(
            finished.won
              ? 'games.minesweeper_v1.result.wonBody'
              : 'games.minesweeper_v1.result.lostBody',
          )}
        </p>
        {finished.durationSeconds !== null && (
          <dl className="text-sm">
            <dt className="opacity-60">{t('games.minesweeper_v1.hud.time')}</dt>
            <dd className="font-mono text-lg">
              {formatDuration(finished.durationSeconds)}
            </dd>
          </dl>
        )}
        <Button className={cx('mt-2')} onClick={onNewGame}>
          {t('games.minesweeper_v1.result.playAgain')}
        </Button>
      </div>
    </Modal>
  );
}
