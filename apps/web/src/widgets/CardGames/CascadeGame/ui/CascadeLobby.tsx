'use client';

import { useMemo, useCallback } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { CASCADE_THEMES } from '../lib/constants';
import {
  type CascadeMode,
  type CascadeOptions,
  type CascadeTheme,
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

const CASCADE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #c4b5fd 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
};

function resolveOptions(raw: unknown): CascadeOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    stackingEnabled: boolean;
    lastCardCallEnabled: boolean;
  }>;
  const knownModes = ['classic', 'pure', 'speed'] as const;
  const mode: CascadeMode = knownModes.includes(r.mode as CascadeMode)
    ? (r.mode as CascadeMode)
    : 'classic';
  const theme = (r.theme ?? r.variant ?? 'adventure') as CascadeTheme;
  return {
    variant: theme,
    theme,
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
      CASCADE_THEMES.find((v) => v.id === options.variant) ?? CASCADE_THEMES[0],
    [options.variant],
  );

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
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            handleOptionChange({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>

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
    </div>
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
      theme={getLobbyTheme(
        CASCADE_THEMES,
        options.variant,
        CASCADE_LOBBY_THEME.fallbackLightGradient,
        CASCADE_LOBBY_THEME.buttonGradient,
      )}
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
