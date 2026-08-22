'use client';

import { memo, useCallback, useState } from 'react';
import { ReusableGameLobby } from '@/features/games/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import type { HeartsVariant } from '../types';
import { HEARTS_VARIANTS } from '../lib/constants';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

interface HeartsLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (opts?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onKickPlayer: (userId: string) => void;
  onRefresh: () => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  variant: HeartsVariant;
}

export const HeartsLobby = memo(function HeartsLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  variant,
}: HeartsLobbyProps) {
  const { t } = useTranslation();
  const [selectedVariant, setSelectedVariant] =
    useState<HeartsVariant>(variant);

  const handleReorderPlayers = useCallback(() => {}, []);

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
      isHost={isHost}
      startBusy={startBusy}
      gameName="Hearts"
      gameIcon="♥"
      onStartGame={onStartGame}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
      onReorderPlayers={handleReorderPlayers}
      optionsSlot={
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
              {t('games.hearts_v1.lobby.variant' as TranslationKey)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HEARTS_VARIANTS.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`rounded-lg p-2 text-sm transition-all ${
                    selectedVariant === v.id
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span className="mr-1">{v.emoji}</span>
                  {t(v.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
});
