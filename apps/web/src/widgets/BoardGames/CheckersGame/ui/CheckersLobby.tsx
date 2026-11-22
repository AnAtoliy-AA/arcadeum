'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { withBotDifficulty } from '@/features/games/ui/lobbyConfig';
import type {
  GameLobbyHostProps,
  LobbyBotStartOptions,
} from '@/features/games/ui/ReusableGameLobby.types';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { RulesModal } from './RulesModal';
import { CHECKERS_THEMES } from '../lib/constants';
import {
  CHECKERS_LOBBY_THEME,
  CheckersLobbyOptionsPanel,
  resolveCheckersLobbyOptions,
} from './CheckersLobbyOptions';

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
}: GameLobbyHostProps<LobbyBotStartOptions>) {
  const { t } = useTranslation();
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const options = useMemo(
    () => resolveCheckersLobbyOptions(room.gameOptions, equippedTheme),
    [room.gameOptions, equippedTheme],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        CHECKERS_THEMES,
        variant,
        CHECKERS_LOBBY_THEME.fallbackLightGradient,
        CHECKERS_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const found = CHECKERS_THEMES.find((v) => v.id === variant);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.checkers_v1.name'),
          gameIcon: '♟️',
          variantName: found ? t(found.name) : undefined,
          seats: { min: 2, max: 2 },
          bots: { enabled: true },
          theme: lobbyTheme,
          labels: {
            startWithBotsLabel: t('games.checkers_v1.lobby.startWithBots'),
          },
        }}
        optionsSlot={
          <CheckersLobbyOptionsPanel
            options={options}
            roomId={room.id}
            userId={userId}
            isHost={isHost}
          />
        }
        onStartGame={withBotDifficulty(onStartGame)}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
      />
    </>
  );
}
