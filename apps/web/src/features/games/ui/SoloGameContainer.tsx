'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
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
import { useSoloPause, type SoloPauseState } from './useSoloPause';
import { SoloPauseOverlay } from './SoloPauseOverlay';
import { SoloGameSwitcher } from './SoloGameSwitcher';
import {
  SoloControlPanel,
  type SoloControlPanelProps,
} from './SoloControlPanel';
import { SoloLeaderboardPanel } from './solo-leaderboard/SoloLeaderboardPanel';
import { formatDuration, useSoloTimer, StatCard } from './SoloGameStats';
import {
  SoloActionButton,
  type SoloActionButtonProps,
} from './SoloActionButton';

export {
  formatDuration,
  useSoloTimer,
  StatCard,
  useSoloPause,
  SoloControlPanel,
  SoloActionButton,
};
export type { SoloPauseState, SoloControlPanelProps, SoloActionButtonProps };

const SoloFullscreenContext = createContext<boolean>(false);

export function useSoloFullscreen(): boolean {
  return useContext(SoloFullscreenContext);
}

function subscribeNoop(): () => void {
  return () => undefined;
}

export interface SoloStatItem {
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  dataTestId?: string;
}

export interface SoloGameContainerProps {
  gameId: string;
  difficulty: string;
  sortBy?: 'score' | 'durationMs';
  order?: 'asc' | 'desc';
  layout?: 'split' | 'stacked';
  maxWidthClassName?: string;
  leaderboardDefaultExpanded?: boolean;
  bgImage?: string;
  pause?: SoloPauseState;
  isRunning: boolean;
  startedAt: number;
  finishedAt: number | null;
  onNewGame: () => void;
  statsItems?: SoloStatItem[];
  hud?: ReactNode;
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
    onClose?: () => void;
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
  leaderboardDefaultExpanded = true,
  bgImage,
  pause,
  isRunning,
  startedAt: _startedAt,
  finishedAt,
  onNewGame,
  statsItems,
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
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const { themeId, setThemeId, theme } = useSoloTheme(gameId);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const defaultPause = useSoloPause(isRunning, finishedAt);
  const resolvedPause = pause ?? defaultPause;

  const [isDismissed, setIsDismissed] = useState(false);
  const handleCloseModal = useCallback(() => {
    setIsDismissed(true);
    modal.onClose?.();
  }, [modal]);
  const handleNewGame = useCallback(() => {
    setIsDismissed(false);
    resolvedPause.resumeGame();
    onNewGame();
  }, [onNewGame, resolvedPause]);

  if (!mounted) {
    return <LoadingState message={t(loadingMessage)} />;
  }

  const themeName =
    t(theme.nameKey as TranslationKey) ||
    theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-/g, ' ');

  const rules = [
    {
      badge: '🎯',
      title: t('games.soloControls.objective') || 'Objective',
      body: t(`games.${gameId}.rules.objective` as TranslationKey) || '',
    },
    {
      badge: '🎮',
      title: t('games.soloControls.howToPlay') || 'How to Play',
      body: t(`games.${gameId}.rules.gameplay` as TranslationKey) || '',
    },
    {
      badge: '🏆',
      title: t('games.soloControls.scoring') || 'Scoring',
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

  const renderedHud =
    hud ??
    (statsItems && statsItems.length > 0 ? (
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
        {statsItems.map((s) => (
          <StatCard
            key={s.id}
            label={s.label}
            value={s.value}
            icon={s.icon}
            dataTestId={s.dataTestId}
          />
        ))}
      </div>
    ) : null);

  const hudCard = (
    <div
      data-testid="solo-hud-card"
      className={cx(
        'relative z-10 flex w-full flex-col rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] shadow-md backdrop-blur-md transition-colors duration-200',
        isFullscreen
          ? 'gap-1 p-1.5 sm:px-2.5 sm:py-1.5'
          : 'gap-1.5 p-2 sm:px-3 sm:py-2',
      )}
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <SoloGameSwitcher currentGameId={gameId} />
          {!controls && difficulty && difficulty !== 'default' && (
            <span className="rounded-md border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
              {difficulty}
            </span>
          )}
        </div>

        {renderedHud && (
          <div className="flex items-center justify-center shrink-0 min-w-0">
            {renderedHud}
          </div>
        )}

        <div className="flex items-center justify-end gap-1 sm:gap-1.5 shrink-0">
          {rules.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRules(true)}
              aria-label="Game rules"
              data-testid="solo-rules-button"
              className="flex items-center gap-1 rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-1.5 sm:px-2 py-1 text-xs font-semibold text-[var(--color)] transition-colors hover:border-[var(--glassBorderStrong)] active:scale-95"
            >
              <span>📖</span>
              <span className="hidden md:inline">
                {t('games.soloControls.rules') || 'Rules'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            data-testid="solo-fullscreen-button"
            className={cx(
              'flex items-center gap-1 rounded-lg border px-1.5 sm:px-2 py-0.5 text-xs font-semibold transition-colors',
              isFullscreen
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm hover:bg-[var(--primary)]/25'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span>{isFullscreen ? '✕' : '⛶'}</span>
            <span className="font-semibold hidden sm:inline">
              {isFullscreen ? 'Exit' : 'Full'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            aria-label="Theme selector"
            data-testid="solo-theme-toggle-button"
            className={cx(
              'flex items-center gap-1 sm:gap-1.5 rounded-lg border px-1.5 sm:px-2 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap',
              showThemePicker
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span className="text-xs leading-none">{theme.emoji}</span>
            <span className="hidden md:inline font-medium">{themeName}</span>
            <span className="text-[10px] text-[var(--textSecondary)] hidden sm:inline">
              🎨
            </span>
          </button>
        </div>
      </div>

      {showThemePicker && (
        <div
          data-testid="solo-theme-picker-drawer"
          className="border-t border-[var(--glassBorder)] pt-1.5"
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

      <SoloControlPanel
        pause={resolvedPause}
        finishedAt={finishedAt}
        controls={controls}
        actions={actions}
        isFullscreen={isFullscreen}
        showLeaderboard={showLeaderboard}
        onToggleLeaderboard={() => setShowLeaderboard((prev) => !prev)}
      />
    </div>
  );

  const resolvedBgImage = bgImage ?? theme.bgImage;

  const gameField = (
    <div
      data-testid="solo-game-field"
      className="relative flex w-full flex-col items-center justify-start min-h-0 pt-2 pb-1"
    >
      <div
        className={cx(
          'relative flex flex-col w-full items-center justify-center transition-opacity duration-200 min-h-0',
          resolvedPause.isPaused &&
            'pointer-events-none select-none blur-sm opacity-25',
        )}
      >
        {children}
      </div>
      {resolvedPause.isPaused && <SoloPauseOverlay pause={resolvedPause} />}
    </div>
  );

  return (
    <SoloFullscreenContext.Provider value={isFullscreen}>
      <div
        ref={containerRef}
        data-testid="solo-game-container"
        data-fullscreen={isFullscreen}
        className={cx(
          'w-full transition-colors duration-200',
          isFullscreen
            ? 'fixed inset-0 z-[1000] h-screen w-screen overflow-hidden bg-[var(--background)] p-1.5 sm:p-3 flex flex-col items-center justify-between'
            : 'relative',
        )}
      >
        {isFullscreen && (
          <div
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
          >
            {resolvedBgImage && (
              <Image
                src={resolvedBgImage}
                alt=""
                fill
                priority
                sizes="100vw"
                aria-hidden="true"
                data-testid="solo-theme-bg-image"
                className="object-cover object-center opacity-25 transition-opacity duration-300"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--tw-gradient-stops))] from-[var(--primary)]/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/60 to-[var(--background)]" />
          </div>
        )}

        {isFullscreen ? (
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 pb-2 flex-1 justify-between min-h-0">
            <div className="w-full max-w-4xl min-[1400px]:max-w-5xl">
              {hudCard}
            </div>
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:gap-6 min-h-0">
              <div className="flex flex-1 w-full justify-center min-h-0">
                {gameField}
              </div>
              {showLeaderboard && (
                <div className="w-full max-w-sm shrink-0 min-[1400px]:w-[320px]">
                  <SoloLeaderboardPanel
                    gameId={gameId}
                    difficulty={difficulty}
                    sortBy={sortBy}
                    order={order}
                    defaultExpanded={leaderboardDefaultExpanded}
                  />
                </div>
              )}
            </div>
          </div>
        ) : layout === 'stacked' ? (
          <div
            className={cx(
              'mx-auto flex w-full flex-col items-center gap-1.5 sm:gap-2 px-1 sm:px-3',
              maxWidthClassName ?? 'max-w-3xl xl:max-w-4xl',
            )}
          >
            <div className="w-full">{hudCard}</div>
            <div className="flex w-full justify-center">{gameField}</div>
            {showLeaderboard && (
              <div className="w-full max-w-3xl">
                <SoloLeaderboardPanel
                  gameId={gameId}
                  difficulty={difficulty}
                  sortBy={sortBy}
                  order={order}
                  defaultExpanded={leaderboardDefaultExpanded}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className={cx(
              'mx-auto w-full items-start px-1.5 sm:px-4',
              maxWidthClassName ?? 'max-w-4xl xl:max-w-5xl',
              showLeaderboard
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 lg:gap-8'
                : 'flex flex-col items-center gap-4',
            )}
          >
            <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
              {hudCard}
              {gameField}
            </div>
            {showLeaderboard && (
              <div className="flex w-full flex-col gap-4">
                <SoloLeaderboardPanel
                  gameId={gameId}
                  difficulty={difficulty}
                  sortBy={sortBy}
                  order={order}
                  defaultExpanded={leaderboardDefaultExpanded}
                />
              </div>
            )}
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
    </SoloFullscreenContext.Provider>
  );
}
