'use client';

import { useMemo, useCallback } from 'react';
import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
} from '@/features/games/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { CASCADE_VARIANTS } from '../lib/constants';
import {
  type CascadeMode,
  type CascadeOptions,
  type CascadeVariant,
  MIN_PLAYERS,
} from '../types';
import { RulesModal } from './RulesModal';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

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
    lastCardCallEnabled: boolean;
  }>;
  const knownModes = ['classic', 'pure', 'speed'] as const;
  const mode: CascadeMode = knownModes.includes(r.mode as CascadeMode)
    ? (r.mode as CascadeMode)
    : 'classic';
  return {
    variant: (r.variant ?? 'cosmic') as CascadeVariant,
    mode,
    stackingEnabled: mode !== 'pure',
    lastCardCallEnabled:
      typeof r.lastCardCallEnabled === 'boolean' ? r.lastCardCallEnabled : true,
  };
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
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );

  const handleOptionChange = useCallback(
    (opts: Record<string, unknown>) => {
      setOption(opts);
    },
    [setOption],
  );

  const variantTokens = useMemo(
    () =>
      CASCADE_VARIANTS.find((v) => v.id === options.variant) ??
      CASCADE_VARIANTS[0],
    [options.variant],
  );

  const variantOptions = CASCADE_VARIANTS.map((v) => ({
    id: v.id,
    label: t(v.name),
    emoji: v.emoji,
  }));

  const modeOptions = [
    {
      id: 'classic',
      label: t('games.create.cascadeModeClassic') || 'Classic',
    },
    {
      id: 'pure',
      label: t('games.create.cascadeModePure') || 'Pure',
    },
    {
      id: 'speed',
      label: t('games.create.cascadeModeSpeed') || 'Speed',
    },
  ];

  const getModeHint = () => {
    switch (options.mode) {
      case 'pure':
        return (
          t('games.create.cascadeModePureHint') ||
          'No stacking — draw cards resolve immediately'
        );
      case 'speed':
        return (
          t('games.create.cascadeModeSpeedHint') ||
          'Stacking enabled with per-turn timer'
        );
      default:
        return (
          t('games.create.cascadeModeClassicHint') ||
          'Full ruleset with stacking'
        );
    }
  };

  const optionsSlot = (
    <YStack gap="$4">
      {isHost && (
        <LobbyOptionSection title={t('games.create.sectionVariant') || 'Theme'}>
          <LobbyChipGroup
            options={variantOptions}
            value={options.variant}
            onChange={(v) => handleOptionChange({ variant: v })}
            accentColor="#fbbf24"
            testIdPrefix="cascade-variant"
          />
        </LobbyOptionSection>
      )}

      {!isHost && (
        <YStack gap="$1">
          <Text color="#fff" fontWeight="600">
            {variantTokens.emoji} {t(variantTokens.name)}
          </Text>
          <Text color="#cbd5e1" fontSize={13}>
            {t(variantTokens.description)}
          </Text>
        </YStack>
      )}

      {isHost && (
        <LobbyOptionSection
          title={t('games.create.cascadeMode') || 'Game Mode'}
          hint={getModeHint()}
        >
          <LobbyChipGroup
            options={modeOptions}
            value={options.mode}
            onChange={(v) => handleOptionChange({ mode: v })}
            accentColor="#fbbf24"
            testIdPrefix="cascade-mode"
          />
        </LobbyOptionSection>
      )}

      <LobbyToggle
        label={t('games.cascade_v1.lobby.stacking')}
        checked={options.stackingEnabled}
        onCheckedChange={() => {}}
        disabled
      />

      <LobbyToggle
        label={t('games.cascade_v1.lobby.lastCardCall')}
        checked={options.lastCardCallEnabled}
        onCheckedChange={(val) =>
          handleOptionChange({ lastCardCallEnabled: val })
        }
        disabled={!isHost}
      />
    </YStack>
  );

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
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
      onReorderPlayers={onReorderPlayers}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
      enableBots
    />
  );
}
