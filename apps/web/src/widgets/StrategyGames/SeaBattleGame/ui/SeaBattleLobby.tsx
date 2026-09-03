'use client';

import React from 'react';
import {
  ReusableGameLobby,
  IconButton,
} from '@/features/games/ui/ReusableGameLobby';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS, getDefaultShipCount } from '../types';
import { SEA_BATTLE_THEMES } from '../lib/constants';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { SeaBattleThemePreview } from './SeaBattleThemePreview';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import { SeaBattleTeamPanel } from './SeaBattleTeamPanel';
import { HouseRulesPanel } from './HouseRulesPanel';
import type { SeaBattleGameOptions } from '@/features/games/sea-battle/lobby';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const SEA_BATTLE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #93c5fd 0%, #7dd3fc 40%, #6ee7b7 70%, #93c5fd 100%)',
  buttonGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
};

const getVariantInfo = (variantId?: string) => {
  const variant = SEA_BATTLE_THEMES.find((v) => v.id === variantId);
  return {
    name: variant?.name,
    emoji: variant?.emoji,
  };
};

interface SeaBattleLobbyProps {
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

export const SeaBattleLobby = React.memo(function SeaBattleLobby({
  room,
  isHost,
  userId,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onShowRules,
  onDeleteRoom,
  onKickPlayer,
  onLeaveRoom,
  onRefresh,
  t,
}: SeaBattleLobbyProps) {
  const roomVariant =
    (room.gameOptions?.theme as string) ||
    (room.gameOptions?.variant as string) ||
    'adventure';
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
        theme: opts.theme ?? opts.variant ?? 'adventure',
      });
    }
  }, [room.id, room.status, room.gameOptions, setOption]);

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
    setSelectedVariant(roomVariant);
  }, [roomVariant]);

  const theme = getLobbyTheme(
    SEA_BATTLE_THEMES,
    selectedVariant,
    SEA_BATTLE_LOBBY_THEME.fallbackLightGradient,
    SEA_BATTLE_LOBBY_THEME.buttonGradient,
  );
  const variantInfo = getVariantInfo(selectedVariant);

  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.roomPage.errors.loadingRoom');
    if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
    if (room.playerCount < MIN_PLAYERS)
      return t('games.sea_battle_v1.table.lobby.needTwoPlayers');
    if (isHost) return t('games.sea_battle_v1.table.lobby.hostCanStart');
    return t('games.sea_battle_v1.table.lobby.waitingForHost');
  };

  // Theme picker + preview only — team mode controls now live in the
  // dedicated SeaBattleTeamPanel above the lobby so they don't compete with
  // the Start button for stacking context.
  const variantPicker = (
    <LobbyOptionSection title={t('games.create.sectionVariant')}>
      <GameThemePicker
        selectedTheme={selectedVariant}
        onSelect={handleVariantSelect}
        disabled={!isHost}
      />
    </LobbyOptionSection>
  );

  const showTeamPanel = room.status === 'lobby' && (isHost || teamMode);

  const teamPanelSlot = showTeamPanel ? (
    <SeaBattleTeamPanel
      roomId={room.id}
      userId={userId ?? ''}
      hostId={room.hostId}
      isHost={isHost}
      teamMode={teamMode}
      teams={teams}
      hideShipsFromTeammates={hideShipsFromTeammates}
      members={roomMembers}
      teamStartBlocked={teamStartBlocked}
      maxTotalPlayers={maxTotalPlayers}
    />
  ) : null;

  const optionsSlot = (
    <>
      {teamPanelSlot}
      {isHost && room.status === 'lobby' ? (
        <div className="flex flex-col items-stretch gap-4 w-full min-w-0">
          {variantPicker}
          <SeaBattleThemeProvider variant={selectedVariant}>
            <SeaBattleThemePreview selectedVariant={selectedVariant} />
          </SeaBattleThemeProvider>
        </div>
      ) : null}

      {isHost && room.status === 'lobby' && (
        <HouseRulesPanel
          gameOptions={{
            ...(effectiveRoom.gameOptions ?? {}),
            gridSize: currentGridSize,
            shipCount: currentShipCount,
            variant: selectedVariant,
          }}
          ruleComingSoon={ruleComingSoon}
          onOptionChange={handleOptionChange}
        />
      )}
    </>
  );

  const headerActionsSlot = (
    <IconButton
      onClick={() => onShowRules(true)}
      title="Game Rules"
      style={{ fontSize: '1.2rem' }}
    >
      📖
    </IconButton>
  );

  return (
    <div className="flex flex-col items-stretch flex-1 min-h-0">
      <ReusableGameLobby
        room={effectiveRoom}
        userId={userId ?? ''}
        isHost={isHost}
        startBusy={startBusy}
        startDisabled={teamStartBlocked}
        onStartGame={handleStart}
        onReorderPlayers={onReorderPlayers}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onLeaveRoom={onLeaveRoom}
        onRefresh={onRefresh}
        gameName={t('games.sea_battle_v1.name' as TranslationKey)}
        gameIcon="🚢"
        roomIcon={variantInfo.emoji || '⚓'}
        variantName={
          variantInfo.name ? t(variantInfo.name as TranslationKey) : undefined
        }
        minPlayers={MIN_PLAYERS}
        labels={{
          waitingLabel: t('games.sea_battle_v1.table.lobby.waitingToStart'),
          subtitleText: getSubtitleText(),
          playersLabel: t('games.rooms.playersLabel'),
          hostControlsLabel: t('games.sea_battle_v1.table.lobby.hostControls'),
          startLabel: t('games.sea_battle_v1.table.actions.start'),
          startingLabel: t('games.sea_battle_v1.table.actions.starting'),
          roomInfoLabel: t('games.sea_battle_v1.table.lobby.roomInfo'),
          fastRoomLabel: t('games.rooms.fastRoom'),
          botCountLabel: t('games.lobby.botCountLabel'),
          startWithBotsLabel: t('games.lobby.startWithBots'),
          difficultyLabel: t('games.lobby.difficultyLabel'),
          difficultyEasyLabel: t('games.lobby.difficultyEasy'),
          difficultyMediumLabel: t('games.lobby.difficultyMedium'),
          difficultyHardLabel: t('games.lobby.difficultyHard'),
        }}
        theme={theme}
        showReorderControls={true}
        showInvitedPlayers={false}
        optionsSlot={optionsSlot}
        headerActionsSlot={headerActionsSlot}
        enableBots={true}
        onRuleComingSoonChange={setRuleComingSoon}
      />
    </div>
  );
});
