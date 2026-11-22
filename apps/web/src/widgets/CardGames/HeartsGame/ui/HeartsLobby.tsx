'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { useLobbyReorder } from '@/features/games/ui/useLobbyReorder';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { HEARTS_THEMES } from '../lib/constants';
import { RulesModal } from './RulesModal';
import {
  HeartsLobbyOptionsPanel,
  resolveHeartsLobbyOptions,
  HEARTS_LOBBY_THEME,
} from './HeartsLobbyOptions';

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
  accessToken?: string | null;
  onReorderPlayers?: (newOrder: string[]) => void;
}

export function HeartsLobby({
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
}: HeartsLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveHeartsLobbyOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variantTokens =
    HEARTS_THEMES.find((v) => v.id === options.variant) ?? HEARTS_THEMES[0];
  const handleReorder = useLobbyReorder(room.id, accessToken, onReorderPlayers);

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
      isHost={isHost}
      startBusy={startBusy}
      config={{
        gameName: 'Hearts',
        gameIcon: '♥',
        variantName: t(variantTokens.name),
        seats: { min: MIN_PLAYERS },
        bots: { enabled: true },
        theme: getLobbyTheme(
          HEARTS_THEMES,
          options.variant,
          HEARTS_LOBBY_THEME.fallbackLightGradient,
          HEARTS_LOBBY_THEME.buttonGradient,
        ),
      }}
      optionsSlot={
        <HeartsLobbyOptionsPanel
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
