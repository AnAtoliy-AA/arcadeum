'use client';

import { memo, useMemo } from 'react';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
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
  const { tokens } = useCatDashTheme();

  const currentPlayer = useMemo(() => {
    if (!currentEntryId) return null;
    return snapshot.players.find((p) => p.playerId === currentEntryId);
  }, [snapshot.players, currentEntryId]);

  if (!currentPlayer) return null;

  return (
    <div
      className="box-border flex flex-row items-center justify-center gap-3 py-3 px-4 rounded-3xl border-[1.5px]"
      style={{
        backgroundColor: myTurn
          ? 'rgba(124, 58, 237, 0.18)'
          : 'rgba(255, 255, 255, 0.03)',
        borderColor: myTurn ? tokens.playerBorder : tokens.trackBorder,
      }}
    >
      <RealisticCat catId={currentPlayer.catId} size={40} />
      <span
        className="box-border text-[18px] font-bold tracking-[0.5px]"
        style={{ color: tokens.text }}
      >
        {myTurn
          ? '🎲 Your turn — roll the dice!'
          : `⏳ ${resolveName(currentEntryId)} is rolling...`}
      </span>
    </div>
  );
});
