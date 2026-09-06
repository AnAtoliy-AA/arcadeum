'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button, CloseIcon, LinkButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { useSound } from '@/shared/lib/sound';
import { CloseButton } from './SharedModal';
import { VictoryCelebration } from './VictoryCelebration';
import {
  GameResultStatsGrid,
  type GameResultStats,
} from './GameResultStatsGrid';
import { PostGameSuggestions } from './PostGameSuggestions';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import type { RatingDelta } from '@/features/ranking/model/types';
import {
  getThemeById,
  SHARED_THEMES,
  type GameTheme,
} from '@/features/games/lib/shared-themes';

export type GameResultKind = 'victory' | 'defeat' | 'draw';

export interface GameResultModalProps {
  isOpen: boolean;
  result: GameResultKind | null;
  gameName?: string;
  /** Game slug for routing (e.g. "chess", "sea-battle"). */
  gameSlug?: string;
  onRematch?: () => void;
  rematchLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    testId?: string;
  };
  onClose?: () => void;
  rematchLoading?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  messages?: { title: string; message?: string };
  ratingDelta?: RatingDelta | null;
  theme?: GameTheme | string | null;
  stats?: GameResultStats | null;
  analysis?: {
    content: React.ReactNode;
    viewLabel: string;
    backLabel: string;
  } | null;
  /** Room ID for challenge/share CTAs (post-game viral loop, roadmap 7C). */
  roomId?: string;
  /** Invite code for the room. */
  inviteCode?: string;
  /** Callback to navigate to a new game. */
  onPlayAnother?: () => void;
  /** Opponent's user ID for sending friend request. */
  opponentUserId?: string;
}

const TONE_BACKDROP_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,rgba(0,0,0,0.65)_100%)]',
  defeat:
    'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0%,rgba(0,0,0,0.65)_100%)]',
  draw: 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,rgba(0,0,0,0.65)_100%)]',
};

const TONE_TITLE_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm dark:from-amber-200 dark:via-yellow-400 dark:to-amber-300',
  defeat:
    'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent drop-shadow-sm dark:from-red-400 dark:via-rose-500 dark:to-red-600',
  draw: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm dark:from-indigo-300 dark:via-purple-300 dark:to-indigo-400',
};

const TONE_CONTAINER_BORDER: Record<GameResultKind, string> = {
  victory: 'border-amber-500/40 shadow-[0_20px_80px_rgba(245,158,11,0.2)]',
  defeat: 'border-red-500/40 shadow-[0_20px_80px_rgba(239,68,68,0.2)]',
  draw: 'border-indigo-500/40 shadow-[0_20px_80px_rgba(99,102,241,0.2)]',
};

function resolveTheme(
  themeInput: GameTheme | string | null | undefined,
): GameTheme {
  if (!themeInput) return SHARED_THEMES[0];
  if (typeof themeInput === 'string') {
    return getThemeById(themeInput) ?? SHARED_THEMES[0];
  }
  return themeInput;
}

export function GameResultModal({
  isOpen,
  result,
  gameName,
  gameSlug,
  onRematch,
  rematchLabel,
  secondaryAction,
  onClose,
  rematchLoading,
  t,
  messages,
  ratingDelta,
  theme,
  stats,
  analysis,
  roomId,
  inviteCode,
  onPlayAnother,
  opponentUserId,
}: GameResultModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { play } = useSound();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastOpen, setLastOpen] = useState(isOpen);

  if (lastOpen !== isOpen) {
    setLastOpen(isOpen);
    if (!isOpen) setShowAnalysis(false);
  }

  const playedForRef = useRef<GameResultKind | null>(null);
  useEffect(() => {
    if (!isOpen || !result) {
      playedForRef.current = null;
      return;
    }
    if (playedForRef.current === result) return;
    playedForRef.current = result;
    if (result === 'victory') play('win');
    else if (result === 'defeat') play('lose');
  }, [isOpen, result, play]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !result || !isClient) return null;

  const resolvedTheme = resolveTheme(theme);
  const isVictory = result === 'victory';
  const isDraw = result === 'draw';
  const emoji = isVictory ? '🏆' : isDraw ? '🤝' : '💀';

  const title =
    messages?.title ?? t(`games.table.${result}.title` as TranslationKey);
  const body =
    messages?.message ?? t(`games.table.${result}.message` as TranslationKey);

  const modalNode = (
    <div
      data-testid="game-result-container"
      className="fixed inset-0 z-[9999] overflow-hidden"
    >
      <div
        className={cx(
          'fixed inset-0 z-0 h-[100dvh] w-screen backdrop-blur-md',
          TONE_BACKDROP_CLASSES[result],
        )}
      />

      <VictoryCelebration tone={result} theme={resolvedTheme} />

      <div className="fixed inset-0 z-10 flex h-[100dvh] w-screen items-center justify-center p-4">
        <div
          data-testid="game-result-modal"
          data-theme={resolvedTheme.id}
          data-tone={result}
          className={cx(
            'animate-entrance relative flex max-h-[92dvh] w-[480px] max-w-[95%] flex-col rounded-2xl border bg-[var(--background)] text-[var(--color)] backdrop-blur-2xl shadow-2xl transition-all',
            TONE_CONTAINER_BORDER[result],
          )}
        >
          {/* Fixed Header — close only */}
          <div className="flex shrink-0 justify-end px-4 pt-3">
            {onClose && (
              <CloseButton onClick={onClose} data-testid="modal-close-button">
                <CloseIcon size={16} />
              </CloseButton>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ minHeight: 0 }}>
            {/* Hero: emoji + title */}
            <div className="mb-3 flex flex-col items-center gap-1">
              <span className="text-6xl select-none" role="img" aria-label={result}>
                {emoji}
              </span>
              <h1
                data-testid="game-result-title"
                className={cx(
                  'text-center text-4xl font-black uppercase tracking-tight',
                  TONE_TITLE_CLASSES[result],
                )}
              >
                {title}
              </h1>
              <p className="text-center text-sm text-[var(--textSecondary)] max-w-[320px]">
                {body}
              </p>
            </div>

            {/* Quick stats row */}
            {stats && (
              <div className="mb-3 w-full rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3">
                <GameResultStatsGrid stats={stats} t={t} />
              </div>
            )}

            {/* Rating change */}
            {ratingDelta && (
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
                  {t('games.ranking.ratingUpdated')}
                </span>
                <RatingBadge
                  elo={ratingDelta.elo}
                  tier={ratingDelta.tier}
                  delta={ratingDelta.delta}
                  size="sm"
                />
              </div>
            )}

            {/* Analysis toggle */}
            {analysis && (
              <div className="mb-3 w-full">
                {showAnalysis ? (
                  <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
                        {t('games.chess_v1.analysis.title')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAnalysis(false)}
                        className="text-[10px] text-[var(--primary)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        {analysis.backLabel}
                      </button>
                    </div>
                    {analysis.content}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAnalysis(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-sm font-semibold text-[var(--color)] cursor-pointer hover:bg-[var(--color)]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📊</span>
                    {analysis.viewLabel}
                  </button>
                )}
              </div>
            )}

            {/* Post-game suggestions */}
            {gameSlug && (
              <PostGameSuggestions
                gameName={gameName ?? gameSlug}
                gameSlug={gameSlug}
                roomId={roomId}
                inviteCode={inviteCode}
                onPlayAnother={onPlayAnother}
                opponentUserId={opponentUserId}
              />
            )}
          </div>

          {/* Fixed Footer — compact row */}
          <div className="flex shrink-0 items-center gap-2 border-t border-[var(--glassBorder)] px-4 py-3">
            <LinkButton href="/" variant="ghost" size="sm" className="flex-shrink-0">
              {t('games.common.actions.backToHome')}
            </LinkButton>

            <div className="flex-1" />

            {onRematch && (
              <Button
                variant={isVictory ? 'primary' : 'secondary'}
                size="sm"
                onClick={onRematch}
                disabled={rematchLoading}
                data-testid="rematch-button"
                showShimmer={isVictory}
              >
                {rematchLoading
                  ? t('games.table.rematch.loading' as TranslationKey)
                  : (rematchLabel ?? t('games.table.rematch.button' as TranslationKey))}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={secondaryAction.onClick}
                data-testid={secondaryAction.testId ?? 'result-secondary-button'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode;
}
