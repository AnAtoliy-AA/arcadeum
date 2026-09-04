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
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { useSoloTheme } from '@/features/games/store/soloThemeStore';
import { SoloLeaderboardPanel } from './solo-leaderboard/SoloLeaderboardPanel';

function subscribeNoop(): () => void {
  return () => undefined;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

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

export function StatCard({
  label,
  value,
  icon,
  highlight = false,
  dataTestId,
}: {
  label: string;
  value: string | number;
  icon?: string;
  highlight?: boolean;
  dataTestId?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border px-2.5 py-1.5 transition-all backdrop-blur-md sm:px-4 sm:py-2.5',
        highlight
          ? 'border-rose-500/40 bg-rose-500/15 text-rose-500 shadow-sm shadow-rose-500/20'
          : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] shadow-sm hover:border-[var(--glassBorderStrong)]',
      )}
    >
      <div className="flex items-center gap-1">
        {icon && <span className="text-xs opacity-80">{icon}</span>}
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          {label}
        </span>
      </div>
      <span className="font-mono text-base font-black tabular-nums sm:text-xl">
        {value}
      </span>
    </div>
  );
}

export interface SoloGameContainerProps {
  gameId: string;
  difficulty: string;
  sortBy?: 'score' | 'durationMs';
  order?: 'asc' | 'desc';
  layout?: 'split' | 'stacked';
  maxWidthClassName?: string;
  isRunning: boolean;
  startedAt: number;
  finishedAt: number | null;
  onNewGame: () => void;
  hud: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  modal: {
    result: 'victory' | 'defeat' | null;
    gameName: string;
    rematchLabel: string;
    theme?: string;
    stats: GameResultStats | null;
    messages: { title: string; message: string };
    secondaryAction?: {
      label: string;
      onClick: () => void;
      testId: string;
    };
  };
  loadingMessage: TranslationKey;
}

export function SoloGameContainer({
  gameId,
  difficulty,
  sortBy = 'score',
  order = 'desc',
  layout = 'split',
  maxWidthClassName,
  isRunning,
  startedAt,
  finishedAt,
  onNewGame,
  hud,
  actions,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef, {
    enableKeyboard: true,
  });
  const [showRules, setShowRules] = useState(false);

  const { themeId, setThemeId, theme } = useSoloTheme(gameId);
  const [showThemePicker, setShowThemePicker] = useState(false);

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

  const themeName =
    t(theme.nameKey as TranslationKey) ||
    theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-/g, ' ');

  const rules = [
    {
      badge: '🎯',
      title: 'Objective',
      body: t(`games.${gameId}.rules.objective` as TranslationKey) || '',
    },
    {
      badge: '🎮',
      title: 'How to Play',
      body: t(`games.${gameId}.rules.gameplay` as TranslationKey) || '',
    },
    {
      badge: '🏆',
      title: 'Scoring',
      body: t(`games.${gameId}.rules.scoring` as TranslationKey) || '',
    },
  ].filter((r) => Boolean(r.body));

  const rulesIcon =
    modal.gameName === '2048'
      ? '🔢'
      : modal.gameName === 'Minesweeper'
        ? '💣'
        : modal.gameName === 'Solitaire'
          ? '🃏'
          : '🧩';

  const hudCard = (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 shadow-xl backdrop-blur-xl sm:p-4">
      <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-wider text-[var(--color)] sm:text-base">
            {modal.gameName}
          </span>
          {difficulty && difficulty !== 'default' && (
            <span className="rounded-md border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
              {difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {rules.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRules(true)}
              aria-label="Game rules"
              data-testid="solo-rules-button"
              className="flex items-center gap-1 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color)] transition-all hover:border-[var(--glassBorderStrong)]"
            >
              <span>📖</span>
              <span className="hidden md:inline">Rules</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            data-testid="solo-fullscreen-button"
            className={cx(
              'flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all',
              isFullscreen
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span>{isFullscreen ? '✕' : '⛶'}</span>
            <span className="hidden md:inline">
              {isFullscreen ? 'Exit' : 'Full'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            aria-label="Theme selector"
            data-testid="solo-theme-toggle-button"
            className={cx(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap',
              showThemePicker
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span className="text-sm leading-none">{theme.emoji}</span>
            <span className="hidden sm:inline font-medium">{themeName}</span>
            <span className="text-[10px] text-[var(--textSecondary)]">🎨</span>
          </button>
          {actions}
        </div>
      </div>

      {showThemePicker && (
        <div
          data-testid="solo-theme-picker-drawer"
          className="border-t border-[var(--glassBorder)] pt-3"
        >
          <GameThemePicker
            selectedTheme={themeId}
            onSelect={(newId) => {
              setThemeId(newId);
              setShowThemePicker(false);
            }}
            layout="scroll"
          />
        </div>
      )}

      <div className="w-full border-t border-[var(--glassBorder)] pt-3">
        {hud}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cx(
        'relative w-full transition-all duration-200',
        isFullscreen &&
          'fixed inset-0 z-50 overflow-y-auto bg-[var(--background)] p-4 sm:p-6',
      )}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[var(--primary)]/20 via-[var(--primary)]/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/60 to-[var(--background)]" />
      </div>

      {layout === 'stacked' ? (
        <div
          className={cx(
            'mx-auto flex w-full flex-col items-center gap-5 px-3 sm:px-4',
            maxWidthClassName ?? 'max-w-5xl xl:max-w-6xl',
          )}
        >
          <div className="w-full">{hudCard}</div>
          {controls && (
            <div className="w-full flex justify-center">{controls}</div>
          )}
          <div className="w-full flex justify-center">{children}</div>
          <div className="w-full max-w-3xl">
            <SoloLeaderboardPanel
              gameId={gameId}
              difficulty={difficulty}
              sortBy={sortBy}
              order={order}
              defaultExpanded={true}
            />
          </div>
        </div>
      ) : (
        <div
          className={cx(
            'mx-auto grid w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start px-3 sm:px-4',
            maxWidthClassName ?? 'max-w-5xl xl:max-w-6xl',
          )}
        >
          <div className="flex w-full flex-col items-center gap-4 sm:gap-5">
            {hudCard}
            {controls}
            {children}
          </div>
          <div className="flex w-full flex-col gap-4">
            <SoloLeaderboardPanel
              gameId={gameId}
              difficulty={difficulty}
              sortBy={sortBy}
              order={order}
              defaultExpanded={true}
            />
          </div>
        </div>
      )}

      <GameRulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        title={`${modal.gameName} Rules`}
        icon={rulesIcon}
        variant={themeId}
        rules={rules}
      />

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
        theme={modal.theme ?? themeId}
        stats={modal.stats}
      />
    </div>
  );
}
