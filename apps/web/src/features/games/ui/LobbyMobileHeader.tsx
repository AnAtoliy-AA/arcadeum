'use client';

import type { ReactNode } from 'react';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';

interface LobbyMobileHeaderProps {
  gameIcon: string;
  gameName: string;
  variantName?: string;
  roomName: string;
  isFastMode?: boolean;
  isRanked?: boolean;
  myRating?: {
    elo: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
  } | null;
  headerActionsSlot?: ReactNode;
}

export function LobbyMobileHeader({
  gameIcon,
  gameName,
  variantName,
  roomName,
  isFastMode,
  isRanked,
  myRating,
  headerActionsSlot,
}: LobbyMobileHeaderProps) {
  return (
    <div className="hidden max-[800px]:flex items-center gap-2 px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
      <span className="text-[28px] leading-none shrink-0">{gameIcon}</span>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[15px] font-bold text-[var(--foreground)] truncate">
            {gameName}
          </span>
          {variantName && (
            <span className="text-[12px] font-medium text-[var(--textSecondary)] shrink-0">
              {variantName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] text-[var(--textSecondary)] truncate">
            {roomName}
          </span>
          {isFastMode && (
            <span className="text-[10px] px-1.5 py-px rounded bg-[rgba(234,179,8,0.15)] text-[#eab308] font-medium shrink-0">
              ⚡
            </span>
          )}
          {isRanked && (
            <span className="text-[10px] px-1.5 py-px rounded bg-[rgba(250,204,21,0.18)] text-[#ffd700] font-bold shrink-0">
              ★
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isRanked && myRating && (
          <RatingBadge elo={myRating.elo} tier={myRating.tier} size="sm" />
        )}
        {headerActionsSlot}
      </div>
    </div>
  );
}
