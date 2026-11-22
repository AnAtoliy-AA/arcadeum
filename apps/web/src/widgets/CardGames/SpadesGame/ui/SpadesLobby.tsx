'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { useLobbyReorder } from '@/features/games/ui/useLobbyReorder';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { SPADES_THEMES } from '../lib/constants';
import { RulesModal } from './RulesModal';
import {
  SpadesLobbyOptionsPanel,
  resolveSpadesLobbyOptions,
  SPADES_LOBBY_THEME,
} from './SpadesLobbyOptions';

interface SpadesLobbyProps {
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
  accessToken?: string | null;
  onReorderPlayers?: (newOrder: string[]) => void;
}

export function SpadesLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
  accessToken,
  onReorderPlayers,
}: SpadesLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveSpadesLobbyOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variantTokens =
    SPADES_THEMES.find((v) => v.id === options.variant) ?? SPADES_THEMES[0];
  const handleReorder = useLobbyReorder(room.id, accessToken, onReorderPlayers);

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
      isHost={isHost}
      startBusy={startBusy}
      config={{
        gameName: 'Spades',
        gameIcon: '♠',
        variantName: t(variantTokens.name),
        seats: { min: MIN_PLAYERS },
        bots: { enabled: true },
        theme: getLobbyTheme(
          SPADES_THEMES,
          options.variant,
          SPADES_LOBBY_THEME.fallbackLightGradient,
          SPADES_LOBBY_THEME.buttonGradient,
        ),
      }}
      optionsSlot={
        <SpadesLobbyOptionsPanel
          options={options}
          roomId={room.id}
          userId={userId}
          isHost={isHost}
        />
      }
      rulesModalSlot={
        <RulesModal
          open={!!showRulesOpen}
          onClose={onShowRulesClose ?? (() => {})}
        />
      }
      onStartGame={onStartGame}
      onReorderPlayers={handleReorder}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
    />
  );
}
