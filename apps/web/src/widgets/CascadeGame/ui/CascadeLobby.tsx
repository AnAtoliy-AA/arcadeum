'use client';

import { useMemo } from 'react';
import { YStack, XStack, Text, Switch } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { CASCADE_MODES, CASCADE_VARIANTS } from '../lib/constants';
import {
  type CascadeMode,
  type CascadeOptions,
  type CascadeVariant,
  MIN_PLAYERS,
} from '../types';
import { RulesModal } from './RulesModal';

interface CascadeLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

const getCascadeLobbyTheme = (variantId?: string): GameLobbyTheme => {
  const v = CASCADE_VARIANTS.find((x) => x.id === variantId);
  const lightGradient =
    v?.lightGradient ??
    'linear-gradient(90deg, #f8fafc 0%, #c4b5fd 50%, #f8fafc 100%)';
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
  };
};

function resolveOptions(raw: unknown): CascadeOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    mode: string;
    stackingEnabled: boolean;
  }>;
  const knownModes = CASCADE_MODES.map((m) => m.id) as ReadonlyArray<string>;
  const mode: CascadeMode = knownModes.includes(r.mode ?? '')
    ? (r.mode as CascadeMode)
    : 'classic';
  // Mode is the source of truth; pure disables stacking unconditionally.
  return {
    variant: (r.variant ?? 'cosmic') as CascadeVariant,
    mode,
    stackingEnabled: mode !== 'pure',
  };
}

export function CascadeLobby({
  room,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: CascadeLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variantTokens = useMemo(
    () =>
      CASCADE_VARIANTS.find((v) => v.id === options.variant) ??
      CASCADE_VARIANTS[0],
    [options.variant],
  );
  const modeTokens = useMemo(
    () =>
      CASCADE_MODES.find((m) => m.id === options.mode) ?? CASCADE_MODES[0],
    [options.mode],
  );

  const optionsSlot = (
    <YStack gap="$3" padding="$3" borderRadius="$3" backgroundColor="rgba(0,0,0,0.18)">
      <Text color="#fff" fontWeight="600">
        {t(variantTokens.name)}
      </Text>
      <Text color="#cbd5e1" fontSize={13}>
        {t(variantTokens.description)}
      </Text>
      <XStack alignItems="center" gap="$2" paddingTop="$2">
        <Text color="#fbbf24" fontWeight="600">
          {modeTokens.emoji} {t(modeTokens.name)}
        </Text>
        <Text color="#cbd5e1" fontSize={12}>
          · {t(modeTokens.description)}
        </Text>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <Switch
          checked={options.stackingEnabled}
          disabled
          size="$2"
          aria-label="Stacking penalties"
        >
          <Switch.Thumb />
        </Switch>
        <Text color="#e2e8f0">{t('games.cascade_v1.lobby.stacking')}</Text>
      </XStack>
    </YStack>
  );

  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={startBusy}
      minPlayers={MIN_PLAYERS}
      gameName="Cascade"
      gameIcon={variantTokens.emoji}
      variantName={t(variantTokens.name)}
      theme={getCascadeLobbyTheme(options.variant)}
      optionsSlot={optionsSlot}
      rulesModalSlot={
        <RulesModal
          open={showRulesOpen}
          onClose={onShowRulesClose}
          variant={options.variant}
        />
      }
      onStartGame={onStartGame}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
      enableBots
    />
  );
}
