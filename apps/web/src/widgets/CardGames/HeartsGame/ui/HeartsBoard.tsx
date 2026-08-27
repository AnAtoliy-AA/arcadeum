'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
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
  /** Cards I may legally play right now. */
  legalIds: string[];
  canAct: boolean;
  hasPassed: boolean;
  members?: GameRoomMemberSummary[];
  onPlayCard: (card: string) => void;
  selectedCards: string[];
  onToggleCard: (card: string) => void;
  onConfirmPass: () => void;
}

/** Seat order relative to me around the table (clockwise). */
const SEATS: SeatSide[] = ['bottom', 'left', 'top', 'right'];

const TRICK_SLOT: Record<SeatSide, string> = {
  bottom: 'bottom-1 left-1/2 -translate-x-1/2',
  left: 'left-2 top-1/2 -translate-y-1/2',
  top: 'top-1 left-1/2 -translate-x-1/2',
  right: 'right-2 top-1/2 -translate-y-1/2',
};

/** Mint the hearts game tokens as scoped CSS vars for the board subtree. */
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
      className="flex w-full flex-col gap-4 rounded-3xl border border-[var(--hCardBorder)] p-4 shadow-inner sm:p-6"
      style={boardVars(theme)}
    >
      {/* Status chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
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

      {/* Table */}
      <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] items-center gap-x-3 gap-y-2 sm:gap-x-5">
        <div className="col-start-2 row-start-1 flex justify-center">
          {topSeat && (
            <SeatPanel seat={topSeat} side="top" passing={isPassing} />
          )}
        </div>
        <div className="col-start-1 row-start-2 self-center">
          {leftSeat && (
            <SeatPanel seat={leftSeat} side="left" passing={isPassing} />
          )}
        </div>
        <div className="col-start-3 row-start-2 self-center justify-self-end">
          {rightSeat && (
            <SeatPanel seat={rightSeat} side="right" passing={isPassing} />
          )}
        </div>

        {/* Center trick area — played cards sit near the seat that played them */}
        <div className="relative col-start-2 row-start-2 mx-auto h-44 w-full max-w-md rounded-2xl border border-[var(--hCardBorder)] bg-black/10 sm:h-48">
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
                    <HeartsCard cardId={card} />
                    <span className="max-w-[80px] truncate rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90">
                      {playerName(playerId)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-[76px] w-[54px] items-center justify-center rounded-xl border border-dashed border-[var(--hCardBorder)] text-lg opacity-30 sm:h-20 sm:w-14">
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
            <SeatPanel seat={bottomSeat} side="bottom" passing={isPassing} />
          )}
        </div>
      </div>

      {/* Passing panel */}
      {isPassing && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--hCardBorder)] bg-[var(--hSurface)] px-4 py-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            {hasPassed
              ? t('games.hearts_v1.game.waitingForOpponent')
              : t('games.hearts_v1.game.selectCardsToPass')}
          </p>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((slot) => (
              <span
                key={slot}
                aria-hidden="true"
                className={cx(
                  'h-8 w-8 rounded-lg border-2 transition-colors',
                  selectedCards.length > slot
                    ? 'border-[var(--accent)] bg-[rgba(var(--accentRGB),0.25)]'
                    : 'border-[var(--hCardBorder)] bg-transparent',
                )}
              />
            ))}
            <button
              type="button"
              data-testid="hearts-pass-button"
              onClick={onConfirmPass}
              disabled={!canPass || selectedCards.length !== 3}
              className="ml-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[rgba(var(--accentRGB),0.75)] px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('games.hearts_v1.game.passCards')}
            </button>
          </div>
        </div>
      )}

      {/* My hand */}
      <div className="flex min-h-[92px] items-end justify-center gap-1 pt-1 sm:gap-1.5">
        {myHand.map((cardId) => {
          const playable =
            !isGameOver &&
            (canPass || (!isPassing && canAct && legalSet.has(cardId)));
          return (
            <HeartsCard
              key={cardId}
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
          );
        })}
      </div>
    </div>
  );
});
