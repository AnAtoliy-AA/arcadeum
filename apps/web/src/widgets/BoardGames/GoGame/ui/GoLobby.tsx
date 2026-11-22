'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { pickBotOptions } from '@/features/games/ui/lobbyConfig';
import type { GameLobbyHostProps } from '@/features/games/ui/ReusableGameLobby.types';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import { RulesModal } from './RulesModal';
import { GO_THEMES, resolveGoOptions } from '../lib/constants';
import { GO_LOBBY_THEME, GoLobbyOptionsPanel } from './GoLobbyOptions';

type GoLobbyProps = GameLobbyHostProps<{
  withBots?: boolean;
  botCount?: number;
}>;

export function GoLobby({
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
}: GoLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveGoOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        GO_THEMES,
        variant,
        GO_LOBBY_THEME.fallbackLightGradient,
        GO_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const found = GO_THEMES.find((v) => v.id === variant);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.go_v1.name'),
          gameIcon: '⚫⚪',
          variantName: found ? t(found.name) : undefined,
          seats: { min: 2, max: 2 },
          bots: { enabled: true },
          theme: lobbyTheme,
          labels: { startWithBotsLabel: t('games.go_v1.lobby.startWithBots') },
        }}
        optionsSlot={
          <GoLobbyOptionsPanel
            options={options}
            roomId={room.id}
            userId={userId}
            isHost={isHost}
          />
        }
        onStartGame={pickBotOptions(onStartGame)}
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
