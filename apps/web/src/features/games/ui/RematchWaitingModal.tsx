'use client';

import { useSyncExternalStore, useMemo, useEffect } from 'react';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { Modal, ModalContent, ModalTitle, ModalActions } from './SharedModal';
import { InGameAvatar } from './InGameAvatar';
import type { RematchWaitingState } from '../hooks/useRematch';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

export interface PlayerInfo {
  playerId: string;
  displayName: string;
  alive: boolean;
}

interface RematchWaitingModalProps {
  waiting: RematchWaitingState | null;
  waitingTimeLeft: number;
  players?: PlayerInfo[];
  currentUserId?: string | null;
  onCancel: () => void;
  onJoin: () => void;
  onDismiss: () => void;
  onRetry?: () => void;
  cardVariant?: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function RematchWaitingModal({
  waiting,
  waitingTimeLeft,
  players = [],
  currentUserId,
  onCancel,
  onJoin,
  onDismiss,
  onRetry,
  cardVariant,
  t,
}: RematchWaitingModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const opponent = useMemo(() => {
    return players.find((p) => p.playerId !== currentUserId);
  }, [players, currentUserId]);

  const isMultiplayer = useMemo(() => {
    if (players.length > 0) return players.length > 2;
    if (!waiting) return false;
    const total =
      (waiting.pendingUserIds?.length || 0) +
      (waiting.acceptedUserIds?.length || 0) +
      (waiting.declinedUserIds?.length || 0);
    return total > 2;
  }, [players.length, waiting]);

  const isDismissible = waiting?.status !== 'waiting';

  useEffect(() => {
    if (!waiting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (waiting.status === 'waiting') {
          onCancel();
        } else if (isDismissible) {
          onDismiss();
        }
      } else if (e.key === 'Enter') {
        if (waiting.status === 'partial') {
          onJoin();
        } else if (waiting.status === 'declined' && !isMultiplayer) {
          onJoin();
        } else if (waiting.status === 'expired' && onRetry) {
          onRetry();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    waiting,
    isDismissible,
    isMultiplayer,
    onCancel,
    onDismiss,
    onJoin,
    onRetry,
  ]);

  if (!waiting || !isClient) return null;

  const getProgressWidthClass = (timeLeft: number) => {
    if (timeLeft >= 30) return 'w-full';
    if (timeLeft >= 27) return 'w-[90%]';
    if (timeLeft >= 24) return 'w-[80%]';
    if (timeLeft >= 21) return 'w-[70%]';
    if (timeLeft >= 18) return 'w-[60%]';
    if (timeLeft >= 15) return 'w-[50%]';
    if (timeLeft >= 12) return 'w-[40%]';
    if (timeLeft >= 9) return 'w-[30%]';
    if (timeLeft >= 6) return 'w-[20%]';
    if (timeLeft >= 3) return 'w-[10%]';
    if (timeLeft > 0) return 'w-[5%]';
    return 'w-0';
  };

  const renderStatusBadge = (status: 'waiting' | 'accepted' | 'declined') => {
    if (status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {t('games.table.rematch.invitation.accept' as TranslationKey)}
        </span>
      );
    }
    if (status === 'declined') {
      return (
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {t('games.table.rematch.invitation.decline' as TranslationKey)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        {t('games.table.rematch.loading' as TranslationKey)}
      </span>
    );
  };

  const getPlayerName = (userId: string) => {
    const found = players.find((p) => p.playerId === userId);
    return found?.displayName || `Player ${userId.slice(-4)}`;
  };

  return (
    <Modal
      open={!!waiting}
      onOpenChange={(open) => {
        if (!open && isDismissible) {
          onDismiss();
        }
      }}
    >
      <ModalContent variant={cardVariant} className="max-w-[440px]">
        <div className="flex flex-col items-center text-center gap-3">
          {waiting.status === 'waiting' ? (
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute -inset-2 rounded-full animate-ping opacity-20 bg-indigo-500" />
              <div className="relative rounded-full p-1 bg-gradient-to-tr from-indigo-500/30 to-amber-500/30 border border-indigo-500/40">
                {opponent?.playerId ? (
                  <InGameAvatar
                    playerId={opponent.playerId}
                    name={opponent.displayName}
                    size="lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-indigo-500/20">
                    🔄
                  </div>
                )}
              </div>
            </div>
          ) : waiting.status === 'accepted' ? (
            <div className="w-16 h-16 rounded-full flex items-center justify-center my-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : waiting.status === 'declined' ? (
            <div className="w-16 h-16 rounded-full flex items-center justify-center my-2 bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ) : waiting.status === 'partial' ? (
            <div className="w-16 h-16 rounded-full flex items-center justify-center my-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <span className="text-2xl">👥</span>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center my-2 bg-slate-500/20 border border-slate-500/40 text-slate-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}

          {waiting.rematchNumber && waiting.rematchNumber > 1 ? (
            <span
              data-testid="rematch-series-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 tracking-wide"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {t('games.table.rematchSeries' as TranslationKey, {
                matchNumber: waiting.rematchNumber,
              })}
            </span>
          ) : null}

          <ModalTitle className="text-center font-bold text-[20px]">
            {waiting.status === 'waiting'
              ? t('games.table.rematch.title' as TranslationKey)
              : waiting.status === 'accepted'
                ? t('games.table.rematch.accepted' as TranslationKey)
                : waiting.status === 'declined'
                  ? t('games.table.rematch.declined' as TranslationKey)
                  : waiting.status === 'expired'
                    ? t('games.table.rematch.expired' as TranslationKey)
                    : waiting.status === 'partial'
                      ? t('games.table.rematch.partial' as TranslationKey)
                      : t('games.table.rematch.cancelled' as TranslationKey)}
          </ModalTitle>

          <div
            data-testid="rematch-waiting-status"
            className="text-center text-[15px] leading-[22px] opacity-80 flex flex-col gap-2 w-full"
          >
            {waiting.status === 'waiting' ? (
              <p>
                {opponent?.displayName
                  ? `${t('games.table.rematch.waiting' as TranslationKey)} (${waitingTimeLeft}s)`
                  : `${t('games.table.rematch.waiting' as TranslationKey)} (${waitingTimeLeft}s)`}
              </p>
            ) : null}

            {waiting.status === 'waiting' ? (
              <div className="w-full flex flex-col gap-1.5 my-1">
                <div className="w-full h-2 rounded-full bg-[var(--glassBorder)] overflow-hidden">
                  <div
                    className={cx(
                      'h-full rounded-full transition-all duration-1000 ease-linear',
                      getProgressWidthClass(waitingTimeLeft),
                      waitingTimeLeft <= 10
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-indigo-500 to-amber-400',
                    )}
                  />
                </div>
                <div className="flex justify-between items-center text-[12px] font-mono opacity-70">
                  <span>0s</span>
                  <span
                    className={cx(
                      'font-semibold',
                      waitingTimeLeft <= 10 && 'text-rose-400 animate-pulse',
                    )}
                  >
                    {waitingTimeLeft}s
                  </span>
                  <span>30s</span>
                </div>
              </div>
            ) : null}

            {isMultiplayer ? (
              <div className="flex flex-col gap-2 mt-2 w-full max-h-40 overflow-y-auto px-1">
                {waiting.acceptedUserIds?.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]"
                  >
                    <div className="flex items-center gap-2">
                      <InGameAvatar
                        playerId={id}
                        name={getPlayerName(id)}
                        size="sm"
                      />
                      <span className="text-[14px] font-medium">
                        {getPlayerName(id)}
                      </span>
                    </div>
                    {renderStatusBadge('accepted')}
                  </div>
                ))}
                {waiting.pendingUserIds?.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]"
                  >
                    <div className="flex items-center gap-2">
                      <InGameAvatar
                        playerId={id}
                        name={getPlayerName(id)}
                        size="sm"
                      />
                      <span className="text-[14px] font-medium">
                        {getPlayerName(id)}
                      </span>
                    </div>
                    {renderStatusBadge('waiting')}
                  </div>
                ))}
                {waiting.declinedUserIds?.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <InGameAvatar
                        playerId={id}
                        name={getPlayerName(id)}
                        size="sm"
                      />
                      <span className="text-[14px] font-medium">
                        {getPlayerName(id)}
                      </span>
                    </div>
                    {renderStatusBadge('declined')}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <ModalActions className="w-full mt-2">
            {waiting.status === 'waiting' ? (
              <Button
                data-testid="cancel-rematch-button"
                variant="secondary"
                onClick={onCancel}
                className="w-full"
              >
                {t('games.table.rematch.cancel' as TranslationKey)}
              </Button>
            ) : null}
            {waiting.status === 'partial' ? (
              <div className="flex gap-2 justify-center w-full">
                <Button
                  data-testid="join-rematch-button"
                  variant="primary"
                  onClick={onJoin}
                  className="flex-1"
                >
                  {t('games.table.rematch.joinGame' as TranslationKey)}
                </Button>
                <Button
                  data-testid="cancel-rematch-button"
                  variant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                >
                  {t('games.table.rematch.cancel' as TranslationKey)}
                </Button>
              </div>
            ) : null}
            {waiting.status === 'declined' && !isMultiplayer ? (
              <div className="flex gap-2 justify-center w-full">
                <Button
                  data-testid="play-with-bot-button"
                  variant="primary"
                  onClick={onJoin}
                  className="flex-1"
                >
                  {t('games.table.rematch.playWithBot' as TranslationKey)}
                </Button>
                <Button
                  data-testid="close-rematch-button"
                  variant="secondary"
                  onClick={onDismiss}
                  className="flex-1"
                >
                  {t('games.table.rematch.close' as TranslationKey)}
                </Button>
              </div>
            ) : null}
            {waiting.status === 'expired' && onRetry ? (
              <div className="flex gap-2 justify-center w-full">
                <Button
                  data-testid="try-again-rematch-button"
                  variant="primary"
                  onClick={onRetry}
                  className="flex-1"
                >
                  {t('games.table.rematch.tryAgain' as TranslationKey)}
                </Button>
                <Button
                  data-testid="close-rematch-button"
                  variant="secondary"
                  onClick={onDismiss}
                  className="flex-1"
                >
                  {t('games.table.rematch.close' as TranslationKey)}
                </Button>
              </div>
            ) : null}
            {isDismissible &&
            waiting.status !== 'partial' &&
            !(waiting.status === 'declined' && !isMultiplayer) &&
            !(waiting.status === 'expired' && onRetry) ? (
              <Button
                data-testid="close-rematch-button"
                variant="primary"
                onClick={onDismiss}
                className="w-full"
              >
                {t('games.table.rematch.close' as TranslationKey)}
              </Button>
            ) : null}
          </ModalActions>
        </div>
      </ModalContent>
    </Modal>
  );
}
