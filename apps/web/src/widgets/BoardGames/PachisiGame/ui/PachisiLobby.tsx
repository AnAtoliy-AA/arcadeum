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
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { RulesModal } from './RulesModal';
import { PACHISI_THEMES } from '../lib/constants';
import {
  PACHISI_LOBBY_THEME,
  PachisiLobbyOptionsPanel,
  resolvePachisiLobbyOptions,
} from './PachisiLobbyOptions';

type PachisiLobbyProps = GameLobbyHostProps<LobbyBotStartOptions>;

export function PachisiLobby({
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
}: PachisiLobbyProps) {
  const { t } = useTranslation();
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const options = useMemo(
    () => resolvePachisiLobbyOptions(room.gameOptions, equippedTheme),
    [room.gameOptions, equippedTheme],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        PACHISI_THEMES,
        variant,
        PACHISI_LOBBY_THEME.fallbackLightGradient,
        PACHISI_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const found = PACHISI_THEMES.find((v) => v.id === variant);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.pachisi_v1.name'),
          gameIcon: '🎲',
          variantName: found ? t(found.nameKey as TranslationKey) : undefined,
          seats: { min: 2, max: 4 },
          bots: { enabled: true },
          theme: lobbyTheme,
          labels: {
            startWithBotsLabel: t('games.pachisi_v1.lobby.startWithBots'),
          },
        }}
        optionsSlot={
          <PachisiLobbyOptionsPanel
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
        onClose={onShowRulesClose ?? (() => {})}
        open={!!showRulesOpen}
      />
    </>
  );
}
