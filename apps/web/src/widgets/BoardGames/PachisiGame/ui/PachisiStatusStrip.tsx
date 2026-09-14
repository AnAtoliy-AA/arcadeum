'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PachisiClientState } from '../types';

interface PachisiStatusStripProps {
  snapshot: PachisiClientState;
  currentUserId: string | null;
  myTurn: boolean;
  canRoll: boolean;
  canMove: boolean;
  movableCount: number;
  isGameOver: boolean;
  actionBusy?: boolean;
  lastDie: number | null;
  finishedCounts: Map<string, number>;
  onPassTurn?: () => void;
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8.5L8 3l6 5.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5z" />
      <path d="M6 14V9h4v5" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
    </svg>
  );
}

export function PachisiStatusStrip({
  snapshot,
  currentUserId,
  myTurn,
  canRoll,
  canMove,
  movableCount,
  isGameOver,
  actionBusy = false,
  lastDie,
  finishedCounts,
  onPassTurn,
}: PachisiStatusStripProps) {
  const { t } = useTranslation();

  const seatOf = (pid: string): number => snapshot.seats[pid] ?? 0;
  const isExtraRoll = myTurn && canRoll && snapshot.consecutiveSixes > 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {snapshot.playerOrder.map((pid) => {
            const seat = seatOf(pid);
            const finished = finishedCounts.get(pid) ?? 0;
            const total = snapshot.tokens[pid]?.length ?? 4;
            const isMe = pid === currentUserId;
            return (
              <span
                key={`score-${pid}`}
                className={`pachisi-score-pill-seat-${seat} flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  isMe ? 'ring-1 ring-white/60' : ''
                }`}
              >
                <span
                  className={`pachisi-token pachisi-token-seat-${seat} h-2.5 w-2.5 rounded-full border`}
                />
                <HomeIcon className="h-3 w-3 opacity-70" />
                {finished}/{total}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isExtraRoll && (
            <span
              className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/40"
              data-testid="pachisi-extra-roll-badge"
            >
              <SparkleIcon className="h-3 w-3" />
              {t('games.pachisi_v1.game.extraRoll')}
            </span>
          )}

          {lastDie != null && !isGameOver && !canRoll && (
            <span className="text-[10px] font-semibold text-white/50">
              {t('games.pachisi_v1.game.lastRoll', { value: lastDie })}
            </span>
          )}
        </div>
      </div>

      {canMove && movableCount > 0 && (
        <div
          className="text-center text-[12px] font-bold text-emerald-300"
          data-testid="pachisi-move-hint"
        >
          {t('games.pachisi_v1.game.yourTurnToMove')}
          <span className="mt-0.5 block text-[11px] text-emerald-200/80">
            {t('games.pachisi_v1.game.tapToken')}
          </span>
        </div>
      )}

      {canMove && movableCount === 0 && (
        <div
          className="flex flex-col items-center gap-1.5"
          data-testid="pachisi-no-moves"
        >
          <div className="text-center text-[12px] font-bold text-amber-300">
            {t('games.pachisi_v1.game.noLegalMoves')}
          </div>
          {onPassTurn && (
            <button
              aria-label={t('games.pachisi_v1.game.passTurn')}
              className="rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-900/60 active:scale-95 disabled:opacity-50"
              data-testid="pachisi-pass-button"
              disabled={actionBusy}
              onClick={onPassTurn}
              type="button"
            >
              {t('games.pachisi_v1.game.passTurn')}
            </button>
          )}
        </div>
      )}

      {!myTurn && !isGameOver && (
        <div
          className="text-center text-[12px] font-semibold text-white/50"
          data-testid="pachisi-waiting"
        >
          {snapshot.phase === 'roll'
            ? t('games.pachisi_v1.game.waitingForOpponentRoll')
            : t('games.pachisi_v1.game.waitingForOpponentMove')}
        </div>
      )}
    </div>
  );
}
