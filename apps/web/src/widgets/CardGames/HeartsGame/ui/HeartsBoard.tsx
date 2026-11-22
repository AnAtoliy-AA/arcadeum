'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';
import type { CSSProperties } from 'react';
import type { GameRoomMemberSummary } from '@/shared/types/games';
import type { HeartsClientState } from '../types';
import { completedTrickCount } from '../lib/legal-cards';
import { useHeartsTheme } from '../lib/HeartsThemeContext';
import type { HeartsThemeTokens } from '../lib/theme';
import { HeartsCard } from './HeartsCard';
import { Chip, SeatPanel, type SeatSide } from './HeartsSeats';

interface HeartsBoardProps {
  snapshot: HeartsClientState;
  currentUserId?: string | null;
  myHand: string[];
  legalIds: string[];
  canAct: boolean;
  hasPassed: boolean;
  members?: GameRoomMemberSummary[];
  onPlayCard: (card: string) => void;
  selectedCards: string[];
  onToggleCard: (card: string) => void;
  onConfirmPass: () => void;
}

const SEATS: SeatSide[] = ['bottom', 'left', 'top', 'right'];

const TRICK_SLOT: Record<SeatSide, string> = {
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  left: 'left-0 top-1/2 -translate-y-1/2',
  top: 'top-0 left-1/2 -translate-x-1/2',
  right: 'right-0 top-1/2 -translate-y-1/2',
};

function boardVars(theme: HeartsThemeTokens): CSSProperties {
  return {
    '--heartColor': theme.heartColor,
    '--spadeColor': theme.spadeColor,
    '--diamondColor': theme.diamondColor,
    '--clubColor': theme.clubColor,
    '--accentRGB': theme.accentRGB,
    '--hCardBorder': theme.cardBorder,
    '--hSurface': theme.surface,
    background: theme.background,
  } as CSSProperties;
}

export const HeartsBoard = memo(function HeartsBoard({
  snapshot,
  currentUserId,
  myHand,
  legalIds,
  canAct,
  hasPassed,
  members,
  onPlayCard,
  selectedCards,
  onToggleCard,
  onConfirmPass,
}: HeartsBoardProps) {
  const { t } = useTranslation();
  const theme = useHeartsTheme();
  const isPassing = snapshot.phase === 'passing';
  const isGameOver = snapshot.phase === 'game_over';
  const legalSet = useMemo(() => new Set(legalIds), [legalIds]);

  const playerName = (playerId: string | null | undefined) => {
    if (!playerId) return '';
    return (
      members?.find((m) => m.id === playerId)?.displayName ??
      playerId.slice(0, 8)
    );
  };

  const order = snapshot.playerOrder;
  const meIdx = Math.max(0, order.indexOf(currentUserId ?? ''));
  const seatId = (offset: number) =>
    order[(meIdx + offset) % Math.max(1, order.length)] ?? null;

  const buildSeat = (offset: number) => {
    const playerId = seatId(offset);
    if (!playerId) return null;
    return {
      playerId,
      name: playerName(playerId),
      score: snapshot.scores[playerId] ?? 0,
      handScore: snapshot.handScores[playerId] ?? 0,
      handCount: snapshot.hands[playerId]?.length ?? 0,
      isTurn:
        !isPassing &&
        !isGameOver &&
        snapshot.playerOrder[snapshot.currentTurnIndex] === playerId,
      hasPassed: (snapshot.pendingPasses[playerId]?.length ?? 0) > 0,
      isMe: offset === 0,
    };
  };

  const playBySeat = useMemo(() => {
    const map = new Map<string, string>();
    for (const play of snapshot.currentTrick.plays) {
      map.set(play.playerId, play.card);
    }
    return map;
  }, [snapshot.currentTrick.plays]);

  const trickNumber = completedTrickCount(snapshot) + 1;
  const canPass = isPassing && !hasPassed && !isGameOver;

  const sideSeat = (side: SeatSide) => buildSeat(SEATS.indexOf(side));
  const topSeat = sideSeat('top');
  const leftSeat = sideSeat('left');
  const rightSeat = sideSeat('right');
  const bottomSeat = sideSeat('bottom');

  return (
    <div
      data-testid="hearts-board"
      className="flex w-full flex-col gap-3 rounded-3xl border border-[var(--hCardBorder)] p-3 shadow-2xl sm:p-5"
      style={boardVars(theme)}
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Chip>
          {t('games.hearts_v1.game.handLabel', {
            n: snapshot.handNumber + 1,
          })}
        </Chip>
        {!isPassing && (
          <Chip tone="accent">
            {t('games.hearts_v1.game.trickLabel', { n: trickNumber })}
          </Chip>
        )}
        {isPassing && (
          <Chip tone="accent">
            {t(
              `games.hearts_v1.passDirection.${snapshot.passDirection}` as Parameters<
                typeof t
              >[0],
            )}
          </Chip>
        )}
        {snapshot.heartsBroken && (
          <Chip tone="danger">♥ {t('games.hearts_v1.game.heartsBroken')}</Chip>
        )}
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-col justify-between rounded-3xl border border-[var(--hCardBorder)] bg-[radial-gradient(ellipse_at_center,rgba(var(--accentRGB),0.12)_0%,rgba(0,0,0,0.45)_100%)] p-3 shadow-inner sm:p-4 min-h-[290px] sm:min-h-[350px]">
        <div className="flex justify-center">
          {topSeat && (
            <SeatPanel seat={topSeat} side="top" passing={isPassing} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 my-auto">
          <div className="shrink-0">
            {leftSeat && (
              <SeatPanel seat={leftSeat} side="left" passing={isPassing} />
            )}
          </div>

          <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44 shrink-0 rounded-full border border-white/10 bg-black/25 shadow-inner backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl sm:text-4xl text-[var(--heartColor)] opacity-20 pointer-events-none select-none">
              ♥
            </span>

            {SEATS.map((side) => {
              const playerId = seatId(SEATS.indexOf(side));
              const card = playerId ? playBySeat.get(playerId) : undefined;
              return (
                <div
                  key={side}
                  className={`absolute ${TRICK_SLOT[side]} flex flex-col items-center gap-0.5 z-10`}
                >
                  {card ? (
                    <>
                      <HeartsCard cardId={card} size="sm" />
                      <span className="max-w-[70px] truncate rounded-full bg-black/60 px-1.5 py-0.2 text-[9px] font-bold text-white/95 shadow">
                        {playerName(playerId)}
                      </span>
                    </>
                  ) : (
                    <span className="flex h-10 w-7 sm:h-12 sm:w-9 items-center justify-center rounded-md border border-dashed border-white/15 text-xs opacity-25">
                      ♥
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="shrink-0">
            {rightSeat && (
              <SeatPanel seat={rightSeat} side="right" passing={isPassing} />
            )}
          </div>
        </div>

        <div className="flex justify-center">
          {bottomSeat && (
            <SeatPanel seat={bottomSeat} side="bottom" passing={isPassing} />
          )}
        </div>
      </div>

      {isPassing && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-2xl border border-[var(--hCardBorder)] bg-[var(--hSurface)] px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md shadow-lg w-full max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              {hasPassed
                ? t('games.hearts_v1.game.waitingForOpponent')
                : t('games.hearts_v1.game.selectCardsToPass')}
            </span>
            <span className="rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[11px] font-black text-[var(--accent)] border border-[var(--accent)]/30">
              {selectedCards.length}/3
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((slot) => {
                const card = selectedCards[slot];
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={card ? () => onToggleCard(card) : undefined}
                    disabled={!card}
                    className={cx(
                      'flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-black transition-all shadow-sm',
                      card
                        ? 'border-[var(--accent)] bg-white text-slate-900 cursor-pointer hover:scale-105 active:scale-95'
                        : 'border-[var(--hCardBorder)] bg-white/5 text-transparent cursor-default',
                    )}
                  >
                    {card ? card : ''}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-testid="hearts-pass-button"
              onClick={onConfirmPass}
              disabled={!canPass || selectedCards.length !== 3}
              className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[rgba(var(--accentRGB),0.8)] px-5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('games.hearts_v1.game.passCards')}
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full overflow-x-auto no-scrollbar pt-6 pb-2">
        <div className="flex items-end justify-start min-w-max mx-auto px-3 sm:justify-center">
          {myHand.map((cardId) => {
            const playable =
              !isGameOver &&
              (canPass || (!isPassing && canAct && legalSet.has(cardId)));
            return (
              <div
                key={cardId}
                className="shrink-0 -ml-5 sm:-ml-3.5 first:ml-0 transition-transform duration-200"
              >
                <HeartsCard
                  cardId={cardId}
                  playable={playable}
                  selected={selectedCards.includes(cardId)}
                  onClick={
                    playable
                      ? () =>
                          isPassing ? onToggleCard(cardId) : onPlayCard(cardId)
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
