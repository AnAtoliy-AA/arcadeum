'use client';

import { useMemo } from 'react';
import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { RulesModal } from './RulesModal';
import { CHECKERS_VARIANTS } from '../lib/constants';
import type { CheckersOptions, CheckersVariant } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const getCheckersTheme = (variantId?: string): GameLobbyTheme => {
  const variant = CHECKERS_VARIANTS.find((v) => v.id === variantId);
  const lightGradient =
    variant?.lightGradient ??
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)';
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  };
};

interface CheckersLobbyProps {
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

function resolveOptions(raw: unknown): CheckersOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    forcedCaptures: boolean;
  }>;
  return {
    variant: (r.variant ?? 'classic') as CheckersVariant,
    forcedCaptures: r.forcedCaptures !== false,
  };
}

export function CheckersLobby({
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
}: CheckersLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(() => getCheckersTheme(variant), [variant]);
  const variantName = useMemo(() => {
    const found = CHECKERS_VARIANTS.find((v) => v.id === variant);
    return found ? t(found.name) : undefined;
  }, [variant, t]);

  const variantOptions = CHECKERS_VARIANTS.map((v) => ({
    id: v.id,
    label: t(v.name),
    emoji: v.emoji,
  }));

  const optionsSlot = (
    <YStack gap="$4">
      <LobbyOptionSection title={t('games.checkers_v1.lobby.variant')}>
        <LobbyChipGroup
          options={variantOptions}
          value={variant}
          onChange={(v) => setOption({ variant: v })}
          disabled={!isHost}
          accentColor="#2563eb"
          testIdPrefix="checkers-variant"
        />
      </LobbyOptionSection>
      <Text fontSize="$2" opacity={0.7}>
        {t('games.checkers_v1.rules.steps')}
      </Text>
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={onStartGame}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.checkers_v1.name')}
        gameIcon="♟️"
        variantName={variantName}
        minPlayers={2}
        theme={lobbyTheme}
        enableBots
        labels={{
          startWithBotsLabel: t('games.checkers_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );
}
