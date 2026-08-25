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
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
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
}

const TONE_BACKDROP_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15)_0%,rgba(5,7,15,0.95)_100%)]',
  defeat:
    'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12)_0%,rgba(5,7,15,0.95)_100%)]',
  draw: 'bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.14)_0%,rgba(5,7,15,0.95)_100%)]',
};

const TONE_TITLE_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent [filter:drop-shadow(0_0_24px_rgba(255,215,0,0.5))]',
  defeat:
    'bg-gradient-to-r from-red-400 via-rose-500 to-red-600 bg-clip-text text-transparent [filter:drop-shadow(0_0_24px_rgba(239,68,68,0.5))]',
  draw: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 bg-clip-text text-transparent [filter:drop-shadow(0_0_20px_rgba(148,163,184,0.4))]',
};

const TONE_CONTAINER_BORDER: Record<GameResultKind, string> = {
  victory: 'border-amber-400/30 shadow-[0_20px_80px_rgba(255,215,0,0.15)]',
  defeat: 'border-red-500/25 shadow-[0_20px_80px_rgba(239,68,68,0.12)]',
  draw: 'border-slate-400/25 shadow-[0_20px_80px_rgba(148,163,184,0.1)]',
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
}: GameResultModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const media = useMediaQuery();
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
      className="fixed inset-0 z-[1200] overflow-hidden"
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
            'animate-entrance relative flex max-h-[92dvh] w-[540px] max-w-[95%] flex-col items-center overflow-y-auto rounded-3xl border bg-slate-950/85 p-6 backdrop-blur-2xl transition-all sm:p-8',
            TONE_CONTAINER_BORDER[result],
          )}
        >
          <div className="relative mb-3 flex w-full flex-col items-center justify-center gap-1.5 pt-1">
            {onClose && (
              <div className="absolute right-0 top-0">
                <CloseButton onClick={onClose} data-testid="modal-close-button">
                  <CloseIcon size={18} />
                </CloseButton>
              </div>
            )}

            {gameName && (
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {gameName}
              </span>
            )}

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>{resolvedTheme.emoji}</span>
              <span>
                {(() => {
                  const rawTheme = t(
                    `games.themes.${resolvedTheme.id}.name` as TranslationKey,
                  );
                  return rawTheme && !rawTheme.startsWith('games.themes.')
                    ? rawTheme
                    : resolvedTheme.id.replace(/-/g, ' ');
                })()}
              </span>
            </div>
          </div>

          <div className="mb-4 flex flex-col items-center gap-1">
            <span className="animate-[float_3s_ease-in-out_infinite] text-6xl select-none sm:text-7xl">
              {emoji}
            </span>
            <h1
              data-testid="game-result-title"
              className={cx(
                'text-center text-4xl font-black uppercase tracking-wider sm:text-5xl',
                TONE_TITLE_CLASSES[result],
                isVictory && 'animate-pulse',
              )}
            >
              {title}
            </h1>
          </div>

          <p className="animate-fade-in-up-delay-2 mb-5 text-center text-base leading-relaxed text-slate-300 sm:text-lg">
            {body}
          </p>

          {stats && (
            <div className="animate-fade-in-up-delay-3 mb-5 w-full">
              <GameResultStatsGrid stats={stats} t={t} />
            </div>
          )}

          {ratingDelta && (
            <div className="animate-fade-in-up-delay-3 mb-6 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t('games.ranking.ratingUpdated')}
              </span>
              <RatingBadge
                elo={ratingDelta.elo}
                tier={ratingDelta.tier}
                delta={ratingDelta.delta}
                size="md"
              />
            </div>
          )}

          {analysis && (
            <div className="animate-fade-in-up-delay-4 mb-5 flex w-full flex-col gap-3">
              {showAnalysis ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    {analysis.content}
                  </div>
                  <Button
                    variant="ghost"
                    size={media.sm ? 'sm' : 'md'}
                    onClick={() => setShowAnalysis(false)}
                  >
                    {analysis.backLabel}
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size={media.sm ? 'sm' : 'md'}
                  className="w-full"
                  onClick={() => setShowAnalysis(true)}
                >
                  {analysis.viewLabel}
                </Button>
              )}
            </div>
          )}

          <div className="animate-fade-in-up-delay-4 flex w-full flex-col gap-3">
            {secondaryAction && (
              <Button
                variant="secondary"
                size={media.sm ? 'md' : 'lg'}
                onClick={secondaryAction.onClick}
                data-testid={
                  secondaryAction.testId ?? 'result-secondary-button'
                }
              >
                {secondaryAction.label}
              </Button>
            )}

            {onRematch && (
              <Button
                variant={isVictory ? 'primary' : 'secondary'}
                size={media.sm ? 'md' : 'lg'}
                onClick={onRematch}
                disabled={rematchLoading}
                data-testid="rematch-button"
                showShimmer={isVictory}
                className={isVictory ? 'active:scale-95' : undefined}
              >
                {rematchLoading
                  ? t('games.table.rematch.loading' as TranslationKey)
                  : (rematchLabel ??
                    t('games.table.rematch.button' as TranslationKey))}
              </Button>
            )}

            <LinkButton href="/" className="w-full" variant="secondary">
              {t('games.common.actions.backToHome' as TranslationKey)}
            </LinkButton>

            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                size={media.sm ? 'sm' : 'md'}
              >
                {t('games.table.modals.common.close' as TranslationKey)}
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
