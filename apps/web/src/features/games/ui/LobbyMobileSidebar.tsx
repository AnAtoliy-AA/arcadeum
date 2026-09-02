'use client';

import React from 'react';
import type { GameRoomSummary } from '@/shared/types/games';

interface LobbyMobileSidebarProps {
  room: GameRoomSummary;
  minPlayers: number;
  maxPlayers: number;
}

export function LobbyMobileSidebar({
  room,
  minPlayers,
  maxPlayers,
}: LobbyMobileSidebarProps) {
  return (
    <div className="hidden max-[1023px]:flex flex-col gap-3 w-full min-w-0 order-1">
      {/* Compact status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[rgba(99,102,241,0.08)] rounded-xl border border-[rgba(99,102,241,0.12)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] text-[var(--textSecondary)]">
            {room.playerCount}/{maxPlayers} players
          </span>
          {room.playerCount < minPlayers && (
            <span className="text-[11px] text-[#f59e0b] font-medium">
              Need {minPlayers - room.playerCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
