'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
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
  /** Cards I may legally play right now. */
  legalIds: string[];
  canAct: boolean;
  canBid: boolean;
  hasBid: boolean;
  members?: GameRoomMemberSummary[];
  onPlayCard: (card: string) => void;
  onBid: (amount: number) => void;
}

/** Seat order relative to me around the table (clockwise). Partner sits top. */
const SEATS: SeatSide[] = ['bottom', 'left', 'top', 'right'];

const TRICK_SLOT: Record<SeatSide, string> = {
  bottom: 'bottom-1 left-1/2 -translate-x-1/2',
  left: 'left-2 top-1/2 -translate-y-1/2',
  top: 'top-1 left-1/2 -translate-x-1/2',
  right: 'right-2 top-1/2 -translate-y-1/2',
};

/** Mint the spades game tokens as scoped CSS vars for the board subtree. */
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

  // Team score/bags are mirrored onto both partners; read via my side's
  // anchor seat (first player of my parity in the seating order).
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
      className="flex w-full flex-col gap-4 rounded-3xl border border-[var(--sCardBorder)] p-4 shadow-inner sm:p-6"
      style={boardVars(theme)}
    >
      {/* Status chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
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

      {/* Table */}
      <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] items-center gap-x-3 gap-y-2 sm:gap-x-5">
        <div className="col-start-2 row-start-1 flex justify-center">
          {topSeat && (
            <SeatPanel seat={topSeat} side="top" bidding={isBidding} />
          )}
        </div>
        <div className="col-start-1 row-start-2 self-center">
          {leftSeat && (
            <SeatPanel seat={leftSeat} side="left" bidding={isBidding} />
          )}
        </div>
        <div className="col-start-3 row-start-2 self-center justify-self-end">
          {rightSeat && (
            <SeatPanel seat={rightSeat} side="right" bidding={isBidding} />
          )}
        </div>

        {/* Center trick area — played cards sit near the seat that played them */}
        <div className="relative col-start-2 row-start-2 mx-auto h-44 w-full max-w-md rounded-2xl border border-[var(--sCardBorder)] bg-black/10 sm:h-48">
          {SEATS.map((side) => {
            const playerId = seatId(SEATS.indexOf(side));
            const card = playerId ? playBySeat.get(playerId) : undefined;
            return (
              <div
                key={side}
                className={`absolute ${TRICK_SLOT[side]} flex flex-col items-center gap-1`}
              >
                {card ? (
                  <>
                    <SpadesCard cardId={card} />
                    <span className="max-w-[80px] truncate rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90">
                      {playerName(playerId)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-[76px] w-[54px] items-center justify-center rounded-xl border border-dashed border-[var(--sCardBorder)] text-lg opacity-30 sm:h-20 sm:w-14">
                    ♠
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* My seat plaque */}
        <div className="col-span-3 row-start-3 flex justify-center">
          {bottomSeat && (
            <SeatPanel seat={bottomSeat} side="bottom" bidding={isBidding} />
          )}
        </div>
      </div>

      {/* Last hand result strip */}
      {!isBidding && lastHandLabel && summary && (
        <div className="flex justify-center">
          <span
            className="rounded-full bg-[var(--sSurface)] px-4 py-1 text-xs text-[var(--muted-foreground)]"
            data-testid="spades-last-hand"
          >
            {lastHandLabel}
          </span>
        </div>
      )}

      {/* Bidding panel */}
      {isBidding && !hasBid && (
        <BidPanel
          myBid={myBid}
          canBid={canBid}
          nilEnabled={snapshot.options.nilEnabled}
          onBid={onBid}
        />
      )}

      {/* My hand */}
      <div className="flex min-h-[92px] items-end justify-center gap-1 pt-1 sm:gap-1.5">
        {myHand.map((cardId) => {
          const playable =
            !isGameOver && !isBidding && canAct && legalSet.has(cardId);
          return (
            <SpadesCard
              key={cardId}
              cardId={cardId}
              playable={playable}
              onClick={playable ? () => onPlayCard(cardId) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
});
