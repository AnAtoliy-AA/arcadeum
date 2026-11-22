'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { withDifficultyDefault } from '@/features/games/ui/lobbyConfig';
import type { GameLobbyHostProps } from '@/features/games/ui/ReusableGameLobby.types';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { RulesModal } from './RulesModal';
import { TIC_TAC_TOE_THEMES } from '../lib/constants';
import { MAX_PLAYERS_BY_BOARD_SIZE } from '../types';
import {
  TIC_TAC_TOE_LOBBY_THEME,
  TicTacToeLobbyOptionsPanel,
  getWinLength,
  resolveTicTacToeLobbyOptions,
} from './TicTacToeLobbyOptions';

export function TicTacToeLobby({
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
}: GameLobbyHostProps) {
  const { t } = useTranslation();
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const options = useMemo(
    () => resolveTicTacToeLobbyOptions(room.gameOptions, equippedTheme),
    [room.gameOptions, equippedTheme],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        TIC_TAC_TOE_THEMES,
        variant,
        TIC_TAC_TOE_LOBBY_THEME.fallbackLightGradient,
        TIC_TAC_TOE_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const found = TIC_TAC_TOE_THEMES.find((v) => v.id === variant);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.tic_tac_toe_v1.name'),
          gameIcon: '❌⭕',
          variantName: found ? t(found.name) : undefined,
          seats: { min: 2, max: MAX_PLAYERS_BY_BOARD_SIZE[options.boardSize] },
          bots: { enabled: true },
          theme: lobbyTheme,
          labels: {
            startWithBotsLabel: t('games.tic_tac_toe_v1.lobby.startWithBots'),
          },
        }}
        optionsSlot={
          <TicTacToeLobbyOptionsPanel
            options={options}
            room={room}
            userId={userId}
            isHost={isHost}
          />
        }
        onStartGame={withDifficultyDefault(onStartGame)}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
        boardSize={options.boardSize}
        winLength={getWinLength(options)}
        expansionMargin={options.expansionMargin}
      />
    </>
  );
}
