'use client';

import { useMemo, useCallback } from 'react';
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
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface CascadeLobbyProps {
  room: GameRoomSummary;
  userId: string;
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
    lastCardCallEnabled: boolean;
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

  const optionsSlot = (
    <YStack
      gap="$3"
      padding="$3"
      borderRadius="$3"
      backgroundColor="rgba(0,0,0,0.18)"
    >
      {isHost && (
        <YStack gap="$2">
          <Text color="#fbbf24" fontWeight="600" fontSize={13}>
            {t('games.create.sectionVariant') || 'Theme'}
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {CASCADE_VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleOptionChange({ variant: v.id })}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${options.variant === v.id ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
                  backgroundColor:
                    options.variant === v.id
                      ? 'rgba(251,191,36,0.15)'
                      : 'transparent',
                  color: options.variant === v.id ? '#fbbf24' : '#e2e8f0',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {v.emoji} {t(v.name)}
              </button>
            ))}
          </XStack>
        </YStack>
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
        <YStack gap="$2">
          <Text color="#fbbf24" fontWeight="600" fontSize={13}>
            {t('games.create.cascadeMode') || 'Game Mode'}
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {(['classic', 'pure', 'speed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleOptionChange({ mode })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: `1px solid ${options.mode === mode ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
                  backgroundColor:
                    options.mode === mode
                      ? 'rgba(251,191,36,0.15)'
                      : 'transparent',
                  color: options.mode === mode ? '#fbbf24' : '#e2e8f0',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {mode === 'classic'
                  ? t('games.create.cascadeModeClassic') || 'Classic'
                  : mode === 'pure'
                    ? t('games.create.cascadeModePure') || 'Pure'
                    : t('games.create.cascadeModeSpeed') || 'Speed'}
              </button>
            ))}
          </XStack>
          <Text color="#94a3b8" fontSize={12}>
            {options.mode === 'pure'
              ? t('games.create.cascadeModePureHint') ||
                'No stacking — draw cards resolve immediately'
              : options.mode === 'speed'
                ? t('games.create.cascadeModeSpeedHint') ||
                  'Stacking enabled with per-turn timer'
                : t('games.create.cascadeModeClassicHint') ||
                  'Full ruleset with stacking'}
          </Text>
        </YStack>
      )}

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

      {isHost ? (
        <XStack alignItems="center" gap="$2">
          <Switch
            checked={options.lastCardCallEnabled}
            onCheckedChange={(val) =>
              handleOptionChange({ lastCardCallEnabled: val })
            }
            size="$2"
            aria-label="Last-Card race"
          >
            <Switch.Thumb />
          </Switch>
          <Text color="#e2e8f0">
            {t('games.cascade_v1.lobby.lastCardCall')}
          </Text>
        </XStack>
      ) : (
        <XStack alignItems="center" gap="$2">
          <Switch
            checked={options.lastCardCallEnabled}
            disabled
            size="$2"
            aria-label="Last-Card race"
          >
            <Switch.Thumb />
          </Switch>
          <Text color="#e2e8f0">
            {t('games.cascade_v1.lobby.lastCardCall')}
          </Text>
        </XStack>
      )}
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
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
      enableBots
    />
  );
}
