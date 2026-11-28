'use client';

import { useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import type {
  GameLobbyHostProps,
  LobbyBotStartOptions,
} from '@/features/games/ui/ReusableGameLobby.types';
import { withBotDifficulty } from '@/features/games/ui/lobbyConfig';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import { RulesModal } from './RulesModal';
import { BACKGAMMON_THEMES } from '../lib/constants';
import {
  BACKGAMMON_LOBBY_THEME,
  BackgammonLobbyOptionsPanel,
  resolveBackgammonLobbyOptions,
} from './BackgammonLobbyOptions';

type BackgammonLobbyProps = GameLobbyHostProps<LobbyBotStartOptions>;

export function BackgammonLobby({
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
}: BackgammonLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveBackgammonLobbyOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        BACKGAMMON_THEMES,
        variant,
        BACKGAMMON_LOBBY_THEME.fallbackLightGradient,
        BACKGAMMON_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const found = BACKGAMMON_THEMES.find((v) => v.id === variant);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.backgammon_v1.name'),
          gameIcon: '🎲',
          variantName: found ? t(found.nameKey as TranslationKey) : undefined,
          seats: { min: 2, max: 2 },
          bots: { enabled: true },
          theme: lobbyTheme,
          labels: {
            startWithBotsLabel: t('games.backgammon_v1.lobby.startWithBots'),
          },
        }}
        optionsSlot={
          <BackgammonLobbyOptionsPanel
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
        mode={options.mode ?? 'standard'}
        onClose={onShowRulesClose ?? (() => {})}
        open={!!showRulesOpen}
      />
    </>
  );
}
