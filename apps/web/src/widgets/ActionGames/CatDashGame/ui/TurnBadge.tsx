'use client';

import { memo, useMemo } from 'react';
import type { CatDashClientState } from '../types';
import { RealisticCat } from './RealisticCat';

interface TurnBadgeProps {
  snapshot: CatDashClientState;
  currentEntryId: string | null;
  myTurn: boolean;
  resolveName: (id?: string | null) => string;
}

export const CatDashTurnBadge = memo(function CatDashTurnBadge({
  snapshot,
  currentEntryId,
  myTurn,
  resolveName,
}: TurnBadgeProps) {
  const currentPlayer = useMemo(() => {
    if (!currentEntryId) return null;
    return snapshot.players.find((p) => p.playerId === currentEntryId);
  }, [snapshot.players, currentEntryId]);

  if (!currentPlayer) return null;

  return (
    <div
      className={`flex flex-row items-center justify-center gap-3 py-3 px-5 rounded-3xl border backdrop-blur-md transition-all duration-200 ${
        myTurn
          ? 'bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/40'
          : 'bg-slate-900/40 border-white/10'
      }`}
    >
      <RealisticCat catId={currentPlayer.catId} size={40} showGlow={myTurn} />
      <span className="text-base sm:text-lg font-bold tracking-wide text-slate-100">
        {myTurn
          ? '🎲 Your turn: roll the dice!'
          : `⏳ ${resolveName(currentEntryId)} is rolling...`}
      </span>
    </div>
  );
});
