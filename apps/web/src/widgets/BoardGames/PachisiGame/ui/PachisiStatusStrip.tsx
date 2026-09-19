'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { PachisiTokenView } from './PachisiTokenView';
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
  myLastDie?: number | null;
  lastRollerId?: string | null;
  isLastRollNoMoves?: boolean;
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
  myLastDie,
  lastRollerId,
  isLastRollNoMoves = false,
  finishedCounts,
  onPassTurn,
}: PachisiStatusStripProps) {
  const { t } = useTranslation();

  const seatOf = (pid: string): number => snapshot.seats[pid] ?? 0;
  const isExtraRoll = myTurn && canRoll && snapshot.consecutiveSixes > 0;
  const displayLastDie =
    myLastDie ?? lastDie ?? snapshot.die ?? snapshot.lastDie ?? null;

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
                className={`pachisi-score-pill-seat-${seat} flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  isMe ? 'ring-1 ring-white/60' : ''
                }`}
              >
                <PachisiTokenView
                  seat={seat}
                  className="h-3.5 w-3.5 shrink-0 shadow-sm"
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

          {displayLastDie != null && !isGameOver && (
            <span
              className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/90 shadow-sm"
              data-testid="pachisi-status-last-roll"
            >
              <span className="text-[10px] text-emerald-400">🎲</span>
              <span className="font-black text-emerald-300">
                {displayLastDie}
              </span>
              <span className="text-white/80">
                {t('games.pachisi_v1.game.lastRoll', { value: displayLastDie })}
              </span>
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
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-center text-[12px] font-bold text-amber-300 shadow-md">
            {displayLastDie != null && (
              <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-200">
                <span>🎲</span>
                <span className="font-black text-amber-100">
                  {displayLastDie}
                </span>
              </span>
            )}
            <span>
              {displayLastDie != null
                ? t('games.pachisi_v1.game.noLegalMovesWithRoll', {
                    value: displayLastDie,
                  })
                : t('games.pachisi_v1.game.noLegalMoves')}
            </span>
          </div>
          {onPassTurn && (
            <button
              aria-label={t('games.pachisi_v1.game.passTurn')}
              className="cursor-pointer rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-900/60 active:scale-95 disabled:opacity-50"
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
        <div className="flex flex-col items-center gap-1">
          {isLastRollNoMoves && displayLastDie != null && (
            <div
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-sm"
              data-testid="pachisi-no-moves-banner"
            >
              <span className="rounded bg-amber-500/20 px-1 font-black text-amber-200">
                🎲 {displayLastDie}
              </span>
              <span>
                {lastRollerId === currentUserId
                  ? t('games.pachisi_v1.game.noLegalMovesTurnPassed', {
                      value: displayLastDie,
                    })
                  : t('games.pachisi_v1.game.opponentRolledNoMoves', {
                      value: displayLastDie,
                    })}
              </span>
            </div>
          )}
          <div
            className="text-center text-[12px] font-semibold text-white/50"
            data-testid="pachisi-waiting"
          >
            {snapshot.phase === 'roll'
              ? t('games.pachisi_v1.game.waitingForOpponentRoll')
              : t('games.pachisi_v1.game.waitingForOpponentMove')}
          </div>
        </div>
      )}
    </div>
  );
}
