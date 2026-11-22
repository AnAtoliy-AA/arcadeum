'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { CASCADE_THEMES } from '../lib/constants';
import { MIN_PLAYERS } from '../types';
import { RulesModal } from './RulesModal';
import {
  CASCADE_LOBBY_THEME,
  CascadeLobbyOptionsPanel,
  resolveCascadeLobbyOptions,
} from './CascadeLobbyOptions';

interface CascadeLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

export function CascadeLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: CascadeLobbyProps) {
  const { t } = useTranslation();
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const options = useMemo(
    () => resolveCascadeLobbyOptions(room.gameOptions, equippedTheme),
    [room.gameOptions, equippedTheme],
  );
  const variantTokens =
    CASCADE_THEMES.find((v) => v.id === options.variant) ?? CASCADE_THEMES[0];

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
      isHost={isHost}
      startBusy={startBusy}
      config={{
        gameName: 'Cascade',
        gameIcon: variantTokens.emoji,
        variantName: t(variantTokens.name),
        seats: { min: MIN_PLAYERS },
        bots: { enabled: true },
        theme: getLobbyTheme(
          CASCADE_THEMES,
          options.variant,
          CASCADE_LOBBY_THEME.fallbackLightGradient,
          CASCADE_LOBBY_THEME.buttonGradient,
        ),
      }}
      optionsSlot={
        <CascadeLobbyOptionsPanel
          options={options}
          roomId={room.id}
          userId={userId}
          isHost={isHost}
        />
      }
      rulesModalSlot={
        <RulesModal
          open={showRulesOpen}
          onClose={onShowRulesClose}
          variant={options.variant}
        />
      }
      onStartGame={onStartGame}
      onReorderPlayers={onReorderPlayers}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
    />
  );
}
