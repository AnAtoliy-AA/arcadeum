'use client';

import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { IconButton } from '@/features/games/ui/ReusableGameLobby';
import { SeaBattleThemePreview } from './SeaBattleThemePreview';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import { SeaBattleTeamPanel } from './SeaBattleTeamPanel';
import type { SeaBattleGameOptions } from '@/features/games/sea-battle/lobby';
import { gamesApi } from '@/features/games/api';
import { useMutation } from '@/shared/hooks/useMutation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

const getSeaBattleTheme = (variantId?: string): GameLobbyTheme => {
  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
  const lightGradient =
    variant?.lightGradient ||
    'linear-gradient(90deg, #93c5fd 0%, #7dd3fc 40%, #6ee7b7 70%, #93c5fd 100%)';

  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
  };
};

const getVariantInfo = (variantId?: string) => {
  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
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
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
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
  const roomVariant = (room.gameOptions?.variant as string) || 'classic';
  const [selectedVariant, setSelectedVariant] = React.useState(roomVariant);
  const { snapshot } = useSessionTokens();

  const { mutate: persistVariant } = useMutation({
    mutationFn: async (newVariant: string) => {
      await gamesApi.updateRoomOptions(
        room.id,
        { variant: newVariant },
        { token: snapshot.accessToken ?? undefined },
      );
    },
    onError: () => {
      setSelectedVariant(roomVariant);
    },
  });

  const handleVariantSelect = React.useCallback(
    (variantId: string) => {
      if (variantId === selectedVariant) return;
      setSelectedVariant(variantId);
      persistVariant(variantId);
    },
    [persistVariant, selectedVariant],
  );

  // Team mode state derived from room game options
  const teamOpts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
  const teamMode = !!teamOpts.teamMode;
  const teams = teamOpts.teams ?? [];
  const hideShipsFromTeammates = !!teamOpts.hideShipsFromTeammates;

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
        ? { ...room, maxPlayers: teamCap }
        : room,
    [room, teamMode, teamCap],
  );

  const allTeamsFull =
    teams.length >= 2 &&
    teams.every((team) => team.playerIds.length === team.targetSize);
  const teamStartBlocked = teamMode && !allTeamsFull;

  const handleStart = React.useCallback(
    (opts?: { withBots?: boolean; botCount?: number }) => {
      if (teamStartBlocked) return;
      onStartGame(opts);
    },
    [onStartGame, teamStartBlocked],
  );

  const roomMembers = (room.members ?? []).map((m) => ({
    userId: m.id,
    displayName: m.displayName,
  }));

  // Sync with room variant when it changes from server
  React.useEffect(() => {
    setSelectedVariant(roomVariant);
  }, [roomVariant]);

  const theme = getSeaBattleTheme(selectedVariant);
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
  const optionsSlot =
    isHost && room.status === 'lobby' ? (
      <XStack
        gap="$4"
        width="100%"
        minWidth={0}
        alignItems="flex-start"
        $sm={{ flexDirection: 'column' }}
      >
        <SeaBattleThemeProvider variant={selectedVariant}>
          <SeaBattleThemePreview selectedVariant={selectedVariant} />
        </SeaBattleThemeProvider>

        <YStack gap="$2" flex={1} minWidth={0} maxHeight={320}>
          <Text
            fontSize={10}
            color="rgba(148,163,184,0.6)"
            letterSpacing={2}
            textTransform="uppercase"
          >
            {t('games.sea_battle_v1.table.lobby.theme' as TranslationKey)}
          </Text>
          {/* Vertical, scrollable list to the right of the preview board so
              theme chips never bleed into the sidebar. */}
          <YStack gap="$2" overflow="scroll" paddingRight="$1">
            {SEA_BATTLE_VARIANTS.map((variant) => (
              <XStack
                key={variant.id}
                alignItems="center"
                gap="$2"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={12}
                borderWidth={1.5}
                cursor="pointer"
                onClick={() => handleVariantSelect(variant.id)}
                borderColor={
                  selectedVariant === variant.id
                    ? 'rgba(96,165,250,0.6)'
                    : 'rgba(255,255,255,0.1)'
                }
                backgroundColor={
                  selectedVariant === variant.id
                    ? 'rgba(96,165,250,0.12)'
                    : 'rgba(255,255,255,0.03)'
                }
              >
                <Text fontSize={14}>{variant.emoji}</Text>
                <Text
                  fontSize={12}
                  fontWeight="500"
                  color={selectedVariant === variant.id ? '#93c5fd' : '#cbd5e1'}
                >
                  {t(variant.name as TranslationKey)}
                </Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </XStack>
    ) : null;

  const headerActionsSlot = (
    <IconButton
      onClick={() => onShowRules(true)}
      title="Game Rules"
      style={{ fontSize: '1.2rem' }}
    >
      📖
    </IconButton>
  );

  // When team mode is on, the team panel + lobby together exceed the viewport,
  // so the wrapping YStack scrolls as one unit. We also disable
  // ReusableGameLobby's own LobbyContent scroll (scoped via the
  // data-team-mode-scroll attribute) so the user only ever sees a single
  // scrollbar instead of nested scroll layers. In FFA we leave the lobby's
  // internal scroll untouched.
  const showTeamPanel = room.status === 'lobby' && (isHost || teamMode);

  return (
    <YStack
      flex={1}
      minHeight={0}
      gap="$3"
      data-team-mode-scroll={showTeamPanel ? 'true' : undefined}
      style={showTeamPanel ? { overflowY: 'auto' } : undefined}
    >
      {showTeamPanel && (
        <>
          <style>{`
            [data-team-mode-scroll="true"] .is_LobbyContent {
              overflow-y: visible !important;
              flex: 0 0 auto !important;
              min-height: 0 !important;
            }
          `}</style>
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
          />
        </>
      )}
      <YStack flex={showTeamPanel ? undefined : 1} minHeight={0}>
        <ReusableGameLobby
          room={effectiveRoom}
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
            hostControlsLabel: t(
              'games.sea_battle_v1.table.lobby.hostControls',
            ),
            startLabel: t('games.sea_battle_v1.table.actions.start'),
            startingLabel: t('games.sea_battle_v1.table.actions.starting'),
            roomInfoLabel: t('games.sea_battle_v1.table.lobby.roomInfo'),
            fastRoomLabel: t('games.rooms.fastRoom'),
            botCountLabel: t('games.lobby.botCountLabel'),
            startWithBotsLabel: t('games.lobby.startWithBots'),
          }}
          theme={theme}
          showReorderControls={true}
          showInvitedPlayers={false}
          optionsSlot={optionsSlot}
          headerActionsSlot={headerActionsSlot}
          enableBots={true}
        />
      </YStack>
    </YStack>
  );
});
