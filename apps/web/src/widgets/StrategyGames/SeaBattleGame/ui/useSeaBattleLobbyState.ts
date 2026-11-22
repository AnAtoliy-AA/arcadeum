'use client';

import React from 'react';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { MIN_PLAYERS, getDefaultShipCount } from '../types';
import { SEA_BATTLE_THEMES } from '../lib/constants';
import { TranslationKey } from '@/shared/i18n/useTranslation';
import type { SeaBattleGameOptions } from '@/features/games/sea-battle/lobby';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const SEA_BATTLE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #93c5fd 0%, #7dd3fc 40%, #6ee7b7 70%, #93c5fd 100%)',
  buttonGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
};

export const getVariantInfo = (variantId?: string) => {
  const variant = SEA_BATTLE_THEMES.find((v) => v.id === variantId);
  return {
    name: variant?.name,
    emoji: variant?.emoji,
  };
};

export interface SeaBattleLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  userId?: string;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    gridSize?: number;
    shipCount?: number;
    variant?: string;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onShowRules: (show: boolean) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  onRefresh?: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function getSeaBattleSubtitle(
  room: GameRoomSummary,
  isHost: boolean,
  t: SeaBattleLobbyProps['t'],
): string {
  if (room.status !== 'lobby') return t('games.roomPage.errors.loadingRoom');
  if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
  if (room.playerCount < MIN_PLAYERS)
    return t('games.sea_battle_v1.table.lobby.needTwoPlayers');
  if (isHost) return t('games.sea_battle_v1.table.lobby.hostCanStart');
  return t('games.sea_battle_v1.table.lobby.waitingForHost');
}

export function useSeaBattleLobbyState(
  room: GameRoomSummary,
  userId: string | undefined,
  onStartGame: SeaBattleLobbyProps['onStartGame'],
) {
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const roomVariant =
    (room.gameOptions?.theme as string) ||
    (room.gameOptions?.variant as string) ||
    equippedTheme;
  const [selectedVariant, setSelectedVariant] = React.useState(roomVariant);
  const { setOption } = useRoomOptions({
    roomId: room.id,
    userId: userId ?? '',
  });

  const roomOpts = (room.gameOptions ?? {}) as Record<string, unknown>;
  const [currentGridSize, setCurrentGridSize] = React.useState<number>(
    (roomOpts.gridSize as number) ?? 10,
  );
  const [currentShipCount, setCurrentShipCount] = React.useState<number>(
    (roomOpts.shipCount as number) ?? getDefaultShipCount(currentGridSize),
  );

  const [ruleComingSoon, setRuleComingSoon] = React.useState<
    Map<string, boolean>
  >(new Map());

  const handleVariantSelect = React.useCallback(
    (variantId: string) => {
      if (variantId === selectedVariant) return;
      setSelectedVariant(variantId);
      setOption({ variant: variantId, theme: variantId });
    },
    [setOption, selectedVariant],
  );

  const handleOptionChange = React.useCallback(
    (options: Record<string, unknown>) => {
      if (options.gridSize !== undefined)
        setCurrentGridSize(options.gridSize as number);
      if (options.shipCount !== undefined)
        setCurrentShipCount(options.shipCount as number);
      setOption(options);
    },
    [setOption],
  );

  React.useEffect(() => {
    if (room.status !== 'lobby') return;
    const opts = (room.gameOptions ?? {}) as Record<string, unknown>;
    if (
      opts.gridSize === undefined ||
      opts.shipCount === undefined ||
      opts.variant === undefined ||
      opts.theme === undefined
    ) {
      const gs = (opts.gridSize as number) ?? 10;
      setOption({
        gridSize: opts.gridSize ?? gs,
        shipCount: opts.shipCount ?? getDefaultShipCount(gs),
        variant: opts.variant ?? 'classic',
        theme: opts.theme ?? opts.variant ?? equippedTheme,
      });
    }
  }, [room.id, room.status, room.gameOptions, setOption, equippedTheme]);

  // Team mode state derived from room game options
  const teamOpts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
  const teamMode = !!teamOpts.teamMode;
  // gameOptions is `Record<string, unknown>` over the wire (Mongoose Mixed), so
  // the cast above doesn't validate the runtime shape. Guard with isArray to
  // tolerate stale/corrupted server data — without it, `.reduce` below crashes
  // the entire lobby render the moment `teams` is anything other than nullish
  // or an array.
  const teams = React.useMemo(
    () => (Array.isArray(teamOpts.teams) ? teamOpts.teams : []),
    [teamOpts.teams],
  );
  const hideShipsFromTeammates = !!teamOpts.hideShipsFromTeammates;
  const maxTotalPlayers =
    typeof teamOpts.maxTotalPlayers === 'number' ? teamOpts.maxTotalPlayers : 8;

  // In team mode, the lobby cap is the sum of team target sizes (up to 8).
  // The persisted room.maxPlayers can lag behind this (e.g. when a small FFA
  // room is rematched into a larger team setup), so we override it locally so
  // the lobby reads "8 / 8" instead of "8 / 6".
  const teamCap = React.useMemo(
    () =>
      teams.reduce(
        (sum, t) => sum + (typeof t.targetSize === 'number' ? t.targetSize : 0),
        0,
      ),
    [teams],
  );
  const effectiveRoom = React.useMemo(
    () =>
      teamMode && teamCap > (room.maxPlayers ?? 0)
        ? { ...room, maxPlayers: Math.min(teamCap, maxTotalPlayers) }
        : room,
    [room, teamMode, teamCap, maxTotalPlayers],
  );

  const allTeamsFull =
    teams.length >= 2 &&
    teams.every((team) => team.playerIds.length === team.targetSize);
  const teamStartBlocked = teamMode && !allTeamsFull;

  const handleStart = React.useCallback(
    (opts?: {
      withBots?: boolean;
      botCount?: number;
      difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    }) => {
      if (teamStartBlocked) return;
      setOption({
        gridSize: currentGridSize,
        shipCount: currentShipCount,
        variant: selectedVariant,
      });
      onStartGame({
        ...opts,
        gridSize: currentGridSize,
        shipCount: currentShipCount,
        variant: selectedVariant,
      });
    },
    [
      onStartGame,
      teamStartBlocked,
      currentGridSize,
      currentShipCount,
      selectedVariant,
      setOption,
    ],
  );

  const roomMembers = (room.members ?? []).map((m) => ({
    userId: m.id,
    displayName: m.displayName,
    equippedAvatarId: m.equippedAvatarId ?? null,
    equippedBadgeId: m.equippedBadgeId ?? null,
    equippedNameColorId: m.equippedNameColorId ?? null,
    equippedFrameId: m.equippedFrameId ?? null,
    equippedAuraId: m.equippedAuraId ?? null,
    equippedBannerId: m.equippedBannerId ?? null,
  }));

  // Sync with room variant when it changes from server
  React.useEffect(() => {
    // Pre-existing server-sync behavior, moved verbatim from SeaBattleLobby.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVariant(roomVariant);
  }, [roomVariant]);

  const theme = getLobbyTheme(
    SEA_BATTLE_THEMES,
    selectedVariant,
    SEA_BATTLE_LOBBY_THEME.fallbackLightGradient,
    SEA_BATTLE_LOBBY_THEME.buttonGradient,
  );
  const variantInfo = getVariantInfo(selectedVariant);

  return {
    selectedVariant,
    handleVariantSelect,
    handleOptionChange,
    currentGridSize,
    currentShipCount,
    ruleComingSoon,
    setRuleComingSoon,
    teamMode,
    teams,
    hideShipsFromTeammates,
    maxTotalPlayers,
    effectiveRoom,
    teamStartBlocked,
    handleStart,
    roomMembers,
    theme,
    variantInfo,
  };
}

export type SeaBattleLobbyState = ReturnType<typeof useSeaBattleLobbyState>;
