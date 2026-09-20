'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { CSSProperties } from 'react';
import type { GameRoomMemberSummary } from '@/shared/types/games';
import type { SpadesClientState } from '../types';
import { completedTrickCount } from '../lib/legal-cards';
import { useSpadesTheme } from '../lib/SpadesThemeContext';
import type { SpadesThemeTokens } from '../lib/theme';
import { SpadesCard } from './SpadesCard';
import { BidPanel } from './BidPanel';
import { Chip, SeatPanel, type SeatSide } from './SpadesSeats';

interface SpadesBoardProps {
  snapshot: SpadesClientState;
  currentUserId?: string | null;
  myHand: string[];
  legalIds: string[];
  canAct: boolean;
  canBid: boolean;
  hasBid: boolean;
  members?: GameRoomMemberSummary[];
  onPlayCard: (card: string) => void;
  onBid: (amount: number) => void;
}

const SEATS: SeatSide[] = ['bottom', 'left', 'top', 'right'];

const TRICK_SLOT: Record<SeatSide, string> = {
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  left: 'left-0 top-1/2 -translate-y-1/2',
  top: 'top-0 left-1/2 -translate-x-1/2',
  right: 'right-0 top-1/2 -translate-y-1/2',
};

function boardVars(theme: SpadesThemeTokens): CSSProperties {
  return {
    '--spadeColor': theme.spadeColor,
    '--heartColor': theme.heartColor,
    '--diamondColor': theme.diamondColor,
    '--clubColor': theme.clubColor,
    '--accentRGB': theme.accentRGB,
    '--sCardBorder': theme.cardBorder,
    '--sSurface': theme.surface,
    background: theme.background,
  } as CSSProperties;
}

export const SpadesBoard = memo(function SpadesBoard({
  snapshot,
  currentUserId,
  myHand,
  legalIds,
  canAct,
  canBid,
  hasBid,
  members,
  onPlayCard,
  onBid,
}: SpadesBoardProps) {
  const { t } = useTranslation();
  const theme = useSpadesTheme();
  const isBidding = snapshot.phase === 'bidding';
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

  const teamScoreKey = meIdx % 2 === 0 ? (order[0] ?? '') : (order[1] ?? '');

  const buildSeat = (offset: number) => {
    const playerId = seatId(offset);
    if (!playerId) return null;
    return {
      playerId,
      name: playerName(playerId),
      score: snapshot.scores[playerId] ?? 0,
      bid: snapshot.bids[playerId] ?? null,
      tricksWon: Math.floor((snapshot.taken[playerId]?.length ?? 0) / 4),
      handCount: snapshot.hands[playerId]?.length ?? 0,
      isTurn:
        !isGameOver &&
        snapshot.playerOrder[snapshot.currentTurnIndex] === playerId,
      isPartner: offset === 2,
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
  const myBid = snapshot.bids[currentUserId ?? ''] ?? null;
  const bags = snapshot.bags[teamScoreKey] ?? 0;

  const summary = snapshot.lastHandSummary;
  const lastHandLabel = summary
    ? t('games.spades_v1.game.lastHand', {
        even: summary.pointsDelta['even'] ?? 0,
        odd: summary.pointsDelta['odd'] ?? 0,
      })
    : null;

  const sideSeat = (side: SeatSide) => buildSeat(SEATS.indexOf(side));
  const topSeat = sideSeat('top');
  const leftSeat = sideSeat('left');
  const rightSeat = sideSeat('right');
  const bottomSeat = sideSeat('bottom');

  return (
    <div
      data-testid="spades-board"
      className="flex w-full flex-col gap-3 rounded-3xl border border-[var(--sCardBorder)] p-3 shadow-2xl sm:p-5"
      style={boardVars(theme)}
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Chip>
          {t('games.spades_v1.game.handLabel', {
            n: snapshot.handNumber + 1,
          })}
        </Chip>
        {!isBidding && (
          <Chip tone="accent">
            {t('games.spades_v1.game.trickLabel', { n: trickNumber })}
          </Chip>
        )}
        <Chip tone="accent">
          ♠ {t('games.spades_v1.game.bagsLabel')}: {bags}
        </Chip>
        {snapshot.spadesBroken && (
          <Chip tone="danger">♠ {t('games.spades_v1.game.spadesBroken')}</Chip>
        )}
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-col justify-between rounded-3xl border border-[var(--sCardBorder)] bg-[radial-gradient(ellipse_at_center,rgba(var(--accentRGB),0.12)_0%,rgba(0,0,0,0.45)_100%)] p-3 shadow-inner sm:p-4 min-h-[290px] sm:min-h-[350px]">
        <div className="flex justify-center">
          {topSeat && (
            <SeatPanel seat={topSeat} side="top" bidding={isBidding} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 my-auto">
          <div className="shrink-0">
            {leftSeat && (
              <SeatPanel seat={leftSeat} side="left" bidding={isBidding} />
            )}
          </div>

          <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44 shrink-0 rounded-full border border-white/10 bg-black/25 shadow-inner backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl sm:text-4xl text-[var(--spadeColor)] opacity-20 pointer-events-none select-none">
              ♠
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
                      <SpadesCard cardId={card} size="sm" />
                      <span className="max-w-[70px] truncate rounded-full bg-black/60 px-1.5 py-0.2 text-[9px] font-bold text-white/95 shadow">
                        {playerName(playerId)}
                      </span>
                    </>
                  ) : (
                    <span className="flex h-10 w-7 sm:h-12 sm:w-9 items-center justify-center rounded-md border border-dashed border-white/15 text-xs opacity-25">
                      ♠
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="shrink-0">
            {rightSeat && (
              <SeatPanel seat={rightSeat} side="right" bidding={isBidding} />
            )}
          </div>
        </div>

        <div className="flex justify-center">
          {bottomSeat && (
            <SeatPanel seat={bottomSeat} side="bottom" bidding={isBidding} />
          )}
        </div>
      </div>

      {!isBidding && lastHandLabel && summary && (
        <div className="flex justify-center">
          <span
            className="rounded-full border border-[var(--sCardBorder)] bg-[var(--sSurface)] px-4 py-1 text-xs font-semibold text-[var(--muted-foreground)] shadow-sm"
            data-testid="spades-last-hand"
          >
            {lastHandLabel}
          </span>
        </div>
      )}

      {isBidding && !hasBid && (
        <BidPanel
          myBid={myBid}
          canBid={canBid}
          nilEnabled={snapshot.options.nilEnabled}
          onBid={onBid}
        />
      )}

      <div className="relative w-full overflow-x-auto no-scrollbar pt-6 pb-2">
        <div className="flex items-end justify-start min-w-max mx-auto px-3 sm:justify-center">
          {myHand.map((cardId) => {
            const playable =
              !isGameOver && !isBidding && canAct && legalSet.has(cardId);
            return (
              <div
                key={cardId}
                className="shrink-0 -ml-5 sm:-ml-3.5 first:ml-0 transition-transform duration-200"
              >
                <SpadesCard
                  key={cardId}
                  cardId={cardId}
                  playable={playable}
                  onClick={playable ? () => onPlayCard(cardId) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
