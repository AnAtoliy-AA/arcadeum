'use client';

import { memo, useMemo } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { CAT_DASH_VARIANTS } from '../lib/constants';
import { CatDashRulesModal } from './RulesModal';

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

const getCatDashTheme = (variantId?: string): GameLobbyTheme => {
  const variant = CAT_DASH_VARIANTS.find((v) => v.id === variantId);
  const lightGradient =
    variant?.lightGradient ??
    'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)';
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  };
};

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
    () => (room.gameOptions ?? {}) as { theme?: string; trackType?: string },
    [room.gameOptions],
  );

  const lobbyTheme = useMemo(
    () => getCatDashTheme(options.theme),
    [options.theme],
  );

  const optionsSlot = (
    <YStack gap="$2" padding="$2">
      <Text fontWeight="bold" fontSize={13} color="#94a3b8">
        Theme
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {CAT_DASH_VARIANTS.map((v) => (
          <YStack
            key={v.id}
            padding="$2"
            paddingHorizontal="$3"
            borderRadius="$3"
            borderWidth={2}
            borderColor={options.theme === v.id ? '#7c3aed' : 'transparent'}
            backgroundColor={
              options.theme === v.id
                ? 'rgba(124, 58, 237, 0.15)'
                : 'rgba(255,255,255,0.05)'
            }
            cursor="pointer"
          >
            <XStack gap="$1" alignItems="center">
              <Text fontSize={16}>{v.emoji}</Text>
              <Text fontSize={12} color="#e2e8f0">
                {v.id}
              </Text>
            </XStack>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        gameName="Cat Dash"
        gameIcon="🐱"
        variantName={options.theme}
        minPlayers={2}
        maxPlayers={6}
        theme={lobbyTheme}
        enableBots
        optionsSlot={optionsSlot}
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
