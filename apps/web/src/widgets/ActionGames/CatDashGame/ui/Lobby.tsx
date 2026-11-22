'use client';

import { memo, useMemo } from 'react';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { CAT_DASH_THEMES } from '../lib/constants';
import { CatDashRulesModal } from './RulesModal';
import {
  CAT_DASH_LOBBY_THEME,
  CatDashLobbyOptionsPanel,
  type CatDashLobbyOptions,
} from './CatDashLobbyOptions';

interface CatDashLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (opts?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onKickPlayer: (userId: string) => void;
  onRefresh: () => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
}

export const CatDashLobby = memo(function CatDashLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  onReorderPlayers,
  showRulesOpen,
  onShowRulesClose,
}: CatDashLobbyProps) {
  const options = useMemo(
    () => (room.gameOptions ?? {}) as CatDashLobbyOptions,
    [room.gameOptions],
  );
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        CAT_DASH_THEMES,
        options.theme,
        CAT_DASH_LOBBY_THEME.fallbackLightGradient,
        CAT_DASH_LOBBY_THEME.buttonGradient,
      ),
    [options.theme],
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: 'Cat Dash',
          gameIcon: '🏎️',
          variantName: options.theme,
          seats: { min: 2, max: 6 },
          bots: { enabled: true, showDifficulty: false },
          theme: lobbyTheme,
        }}
        optionsSlot={
          <CatDashLobbyOptionsPanel
            options={options}
            roomId={room.id}
            userId={userId}
            isHost={isHost}
          />
        }
        onStartGame={onStartGame}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
      />
      <CatDashRulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
      />
    </>
  );
});
