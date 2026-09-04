'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { LoadingState } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation, type TranslationKey } from '@/shared/lib/useTranslation';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { SoloLeaderboardPanel } from './solo-leaderboard/SoloLeaderboardPanel';

/* ───────────────────────── helpers ───────────────────────── */

function subscribeNoop(): () => void {
  return () => undefined;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/* ───────────────────────── timer hook ───────────────────────── */

export function useSoloTimer(
  isRunning: boolean,
  startedAt: number,
): { elapsedMs: number; formatted: string } {
  const [elapsedMs, setElapsedMs] = useState(0);
  const hiddenAtRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      const hiddenBonus = hiddenAtRef.current
        ? Date.now() - hiddenAtRef.current
        : 0;
      const elapsed =
        Date.now() - startedAt - pausedMsRef.current - hiddenBonus;
      setElapsedMs(Math.max(0, elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current !== null) {
        pausedMsRef.current += Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning, startedAt]);

  return { elapsedMs, formatted: formatDuration(elapsedMs) };
}

/* ───────────────────── stat card ───────────────────── */

export function StatCard({
  label,
  value,
  highlight = false,
  dataTestId,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  dataTestId?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border px-2.5 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2',
        highlight
          ? 'border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-300'
          : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)]',
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
        {label}
      </span>
      <span className="font-mono text-base font-extrabold tabular-nums sm:text-lg">
        {value}
      </span>
    </div>
  );
}

/* ───────────────────── container props ───────────────────── */

export interface SoloGameContainerProps {
  gameId: string;
  difficulty: string;
  sortBy?: 'score' | 'durationMs';
  order?: 'asc' | 'desc';
  maxWidthClassName?: string;

  /** Whether the game is currently in progress. */
  isRunning: boolean;
  /** Timestamp (ms) when the game started. */
  startedAt: number;
  /** Timestamp (ms) when the game ended, or null. */
  finishedAt: number | null;
  /** Call to start a new game. */
  onNewGame: () => void;

  /** Content rendered inside the HUD bar (stat cards, buttons, etc). */
  hud: ReactNode;
  /** The game board. */
  children: ReactNode;
  /** Optional extra controls between HUD and board. */
  controls?: ReactNode;

  /** Result modal props (omit isOpen/onClose — managed internally). */
  modal: {
    result: 'victory' | 'defeat' | null;
    gameName: string;
    rematchLabel: string;
    theme: string;
    stats: GameResultStats | null;
    messages: { title: string; message: string };
    secondaryAction?: {
      label: string;
      onClick: () => void;
      testId: string;
    };
  }

  /** Loading message key shown during SSR. */
  loadingMessage: TranslationKey;
}

/* ───────────────────── container ───────────────────── */

export function SoloGameContainer({
  gameId,
  difficulty,
  sortBy = 'score',
  order = 'desc',
  maxWidthClassName = 'max-w-lg',
  isRunning,
  startedAt,
  finishedAt,
  onNewGame,
  hud,
  children,
  controls,
  modal,
  loadingMessage,
}: SoloGameContainerProps) {
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useSoloTimer(isRunning, startedAt);

  const [isDismissed, setIsDismissed] = useState(false);
  const handleCloseModal = useCallback(() => setIsDismissed(true), []);
  const handleNewGame = useCallback(() => {
    setIsDismissed(false);
    onNewGame();
  }, [onNewGame]);

  if (!mounted) {
    return <LoadingState message={t(loadingMessage)} />;
  }

  return (
    <div
      className={cx(
        'mx-auto flex w-full flex-col items-center gap-4 px-2 sm:gap-5 sm:px-3',
        maxWidthClassName,
      )}
    >
      {/* HUD */}
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 shadow-xl backdrop-blur-md sm:p-4">
        {hud}
      </div>

      {/* Optional controls row */}
      {controls}

      {/* Board */}
      {children}

      {/* Leaderboard */}
      <SoloLeaderboardPanel
        gameId={gameId}
        difficulty={difficulty}
        sortBy={sortBy}
        order={order}
      />

      {/* Result modal */}
      <GameResultModal
        isOpen={finishedAt !== null && !isDismissed}
        result={modal.result}
        gameName={modal.gameName}
        onRematch={handleNewGame}
        rematchLabel={modal.rematchLabel}
        secondaryAction={modal.secondaryAction}
        onClose={handleCloseModal}
        t={t}
        messages={modal.messages}
        theme={modal.theme}
        stats={modal.stats}
      />
    </div>
  );
}
