'use client';

import { useMemo } from 'react';
import { InGameAvatar } from '@/features/games/ui/InGameAvatar';
import type { ChessClientState } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

const KING_SYMBOLS = { white: '♔', black: '♚' } as const;

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TurnBar({
  currentTurnColor,
  isCheck,
  isCheckmate,
  fullMoveNumber,
  t,
}: {
  currentTurnColor: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  fullMoveNumber: number;
  t: TranslateFn;
}) {
  return (
    <div className="flex justify-between items-center px-1">
      <span className="text-xs font-semibold text-[var(--color)]">
        {KING_SYMBOLS[currentTurnColor]} {t('games.chess_v1.status.white')}{' '}
        {t('games.chess_v1.status.toMove')}
        {isCheck && !isCheckmate
          ? ` (${t('games.chess_v1.status.check').toLowerCase()})`
          : ''}
      </span>
      <span className="text-xs text-[var(--textSecondary)]">
        {fullMoveNumber}.
      </span>
    </div>
  );
}

export function PlayerCards({
  whiteId,
  blackId,
  whiteName,
  blackName,
  currentTurnColor,
  isGameOver,
  clocks,
  timeControl,
}: {
  whiteId: string;
  blackId: string;
  whiteName: string;
  blackName: string;
  currentTurnColor: 'white' | 'black';
  isGameOver: boolean;
  clocks: Record<string, { remainingSeconds: number } | null> | null;
  timeControl: { incrementSeconds: number } | null;
}) {
  return (
    <div className="flex gap-2 w-full">
      <PlayerCard
        playerId={whiteId}
        name={whiteName}
        isActive={currentTurnColor === 'white' && !isGameOver}
        mainTime={
          clocks?.white ? formatClock(clocks.white.remainingSeconds) : '--:--'
        }
        incrTime={timeControl ? `+${timeControl.incrementSeconds}` : '+0'}
      />
      <PlayerCard
        playerId={blackId}
        name={blackName}
        isActive={currentTurnColor === 'black' && !isGameOver}
        mainTime={
          clocks?.black ? formatClock(clocks.black.remainingSeconds) : '--:--'
        }
        incrTime={timeControl ? `+${timeControl.incrementSeconds}` : '+0'}
      />
    </div>
  );
}

export function PlayerCard({
  playerId,
  name,
  isActive,
  mainTime,
  incrTime,
}: {
  playerId: string;
  name: string;
  isActive: boolean;
  mainTime: string;
  incrTime: string;
}) {
  return (
    <div
      className={`flex-1 flex flex-col gap-1.5 p-2.5 rounded-xl border transition-colors backdrop-blur-md ${
        isActive
          ? 'bg-emerald-500/10 border-amber-500/60 shadow-sm'
          : 'bg-[var(--glassBg)] border-[var(--glassBorder)]'
      }`}
    >
      <div className="flex items-center gap-2">
        <InGameAvatar playerId={playerId} name={name} size="sm" />
        <div className="text-xs font-bold text-[var(--color)] whitespace-nowrap overflow-hidden text-ellipsis">
          {name}
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 p-2 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-center">
          <div className="text-base font-bold text-[var(--color)]">
            {mainTime}
          </div>
          <div className="text-[9px] font-semibold text-[var(--textSecondary)] uppercase mt-0.5">
            MAIN
          </div>
        </div>
        <div className="flex-1 p-2 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-center">
          <div className="text-base font-bold text-[var(--color)]">
            {incrTime}
          </div>
          <div className="text-[9px] font-semibold text-[var(--textSecondary)] uppercase mt-0.5">
            INCR
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameInfoPanel({
  snapshot,
  liveEval,
  analyzing,
  myColor,
  t: _t,
}: {
  snapshot: ChessClientState;
  liveEval?: { cp: number | null; mate: number | null } | null;
  analyzing?: boolean;
  myColor?: 'white' | 'black' | null;
  t: TranslateFn;
}) {
  const shouldFlip = myColor === 'black';

  const displayEval = useMemo(() => {
    if (!liveEval) return null;
    const cp = liveEval.cp != null ? (shouldFlip ? -liveEval.cp : liveEval.cp) : null;
    const mate = liveEval.mate != null ? (shouldFlip ? -liveEval.mate : liveEval.mate) : null;
    return { cp, mate };
  }, [liveEval, shouldFlip]);

  const evalLabel = useMemo(() => {
    if (!displayEval) return analyzing ? '...' : '—';
    if (displayEval.mate != null && displayEval.mate !== 0) return `M${Math.abs(displayEval.mate)}`;
    if (displayEval.cp != null) {
      const pawns = (displayEval.cp / 100).toFixed(1);
      return displayEval.cp > 0 ? `+${pawns}` : pawns;
    }
    return '0.0';
  }, [displayEval, analyzing]);

  const evalWidth = useMemo(() => {
    if (!displayEval || displayEval.cp == null) return 50;
    const clamped = Math.max(-5, Math.min(5, displayEval.cp / 100));
    return 50 + (clamped / 5) * 40;
  }, [displayEval]);

  const barColor =
    evalWidth > 55
      ? 'bg-emerald-500'
      : evalWidth < 45
        ? 'bg-red-500'
        : 'bg-slate-400';

  return (
    <div className="p-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
          GAME INFO
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold text-white">♔</span>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--backgroundHover)] overflow-hidden border border-[var(--glassBorder)]">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${evalWidth}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-zinc-400">♚</span>
        </div>
        <div className="flex justify-between text-[9px] text-[var(--textSecondary)] font-medium">
          <span className="font-bold text-[var(--color)] tabular-nums">{evalLabel}</span>
          <span>{displayEval && displayEval.cp != null && displayEval.cp > 0 ? 'White' : displayEval && displayEval.cp != null && displayEval.cp < 0 ? 'Black' : ''}</span>
        </div>
      </div>
      <div className="flex justify-between items-center py-1.5 border-t border-[var(--glassBorder)]">
        <span className="text-xs text-[var(--textSecondary)] font-medium">
          Turn
        </span>
        <span className="text-xs font-semibold text-[var(--color)] px-2.5 py-0.5 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)]">
          {KING_SYMBOLS[snapshot.currentTurnColor]}{' '}
          {snapshot.currentTurnColor === 'white' ? 'White' : 'Black'}
        </span>
      </div>
      <div className="flex justify-between items-center py-1.5 border-t border-[var(--glassBorder)]">
        <span className="text-xs text-[var(--textSecondary)] font-medium">
          Move
        </span>
        <span className="text-xs font-bold text-[var(--color)]">
          #{snapshot.fullMoveNumber}
        </span>
      </div>
    </div>
  );
}

export function ActionsBar({
  hasDrawOffer,
  isMyDrawOffer,
  hasTakebackOffer,
  isMyTakebackOffer,
  isGameOver,
  isSpectator,
  currentUserId,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onOfferTakeback,
  onAcceptTakeback,
  onDeclineTakeback,
  t,
}: {
  hasDrawOffer: boolean;
  isMyDrawOffer: boolean;
  hasTakebackOffer: boolean;
  isMyTakebackOffer: boolean;
  isGameOver: boolean;
  isSpectator: boolean;
  currentUserId: string | null;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onOfferTakeback: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
  t: TranslateFn;
}) {
  if (!currentUserId || isGameOver || isSpectator) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
        ACTIONS
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onResign}
          className="flex-1 py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold cursor-pointer hover:bg-red-500/25 transition-colors"
        >
          {t('games.chess_v1.actions.resign')}
        </button>
        <button
          type="button"
          onClick={hasDrawOffer && !isMyDrawOffer ? onAcceptDraw : onOfferDraw}
          className="flex-1 py-2 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
        >
          {hasDrawOffer && !isMyDrawOffer
            ? t('games.chess_v1.actions.acceptDraw')
            : t('games.chess_v1.actions.draw')}
        </button>
      </div>
      {hasTakebackOffer && !isMyTakebackOffer && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onAcceptTakeback}
            className="flex-1 py-2 px-3 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-500 text-xs font-semibold cursor-pointer hover:bg-sky-500/25 transition-colors"
          >
            {t('games.chess_v1.actions.acceptTakeback')}
          </button>
          <button
            type="button"
            onClick={onDeclineTakeback}
            className="flex-1 py-2 px-3 rounded-lg bg-zinc-500/15 border border-zinc-500/30 text-zinc-500 text-xs font-semibold cursor-pointer hover:bg-zinc-500/25 transition-colors"
          >
            {t('games.chess_v1.actions.declineTakeback')}
          </button>
        </div>
      )}
      {!hasTakebackOffer && (
        <button
          type="button"
          onClick={onOfferTakeback}
          className="w-full py-2 px-3 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-500 text-xs font-semibold cursor-pointer hover:bg-sky-500/25 transition-colors"
        >
          {t('games.chess_v1.actions.takeback')}
        </button>
      )}
    </div>
  );
}
