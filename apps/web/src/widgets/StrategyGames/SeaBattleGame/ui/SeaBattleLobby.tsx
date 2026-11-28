'use client';

import React from 'react';
import {
  ReusableGameLobby,
  IconButton,
} from '@/features/games/ui/ReusableGameLobby';
import {
  buildBotLabels,
  buildTableLabels,
} from '@/features/games/ui/lobbyConfig';
import { MIN_PLAYERS } from '../types';
import { TranslationKey } from '@/shared/i18n/useTranslation';
import { SeaBattleLobbyOptionsPanel } from './SeaBattleLobbyOptions';
import {
  getSeaBattleSubtitle,
  useSeaBattleLobbyState,
  type SeaBattleLobbyProps,
} from './useSeaBattleLobbyState';

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
  const state = useSeaBattleLobbyState(room, userId, onStartGame);
  const { variantInfo } = state;
  // The i18n helpers take plain string keys; the wrapper's `t` is typed to
  // TranslationKey, which the table/bot key builders cannot statically prove.
  const tl = (key: string) => t(key as TranslationKey);

  return (
    <div className="flex flex-col items-stretch flex-1 min-h-0">
      <ReusableGameLobby
        room={state.effectiveRoom}
        userId={userId ?? ''}
        isHost={isHost}
        startBusy={startBusy}
        startDisabled={state.teamStartBlocked}
        onStartGame={state.handleStart}
        onReorderPlayers={onReorderPlayers}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onLeaveRoom={onLeaveRoom}
        onRefresh={onRefresh}
        config={{
          gameName: t('games.sea_battle_v1.name' as TranslationKey),
          gameIcon: '🚢',
          roomIcon: variantInfo.emoji || '⚓',
          variantName: variantInfo.name
            ? t(variantInfo.name as TranslationKey)
            : undefined,
          seats: { min: MIN_PLAYERS },
          bots: { enabled: true },
          display: { showInvitedPlayers: false },
          theme: state.theme,
          labels: {
            ...buildTableLabels(tl, 'games.sea_battle_v1.table'),
            ...buildBotLabels(tl),
            playersLabel: t('games.rooms.playersLabel'),
            subtitleText: getSeaBattleSubtitle(room, isHost, t),
            difficultyLabel: t('games.lobby.difficultyLabel'),
            difficultyEasyLabel: t('games.lobby.difficultyEasy'),
            difficultyMediumLabel: t('games.lobby.difficultyMedium'),
            difficultyHardLabel: t('games.lobby.difficultyHard'),
          },
        }}
        optionsSlot={
          <SeaBattleLobbyOptionsPanel
            room={room}
            userId={userId}
            isHost={isHost}
            state={state}
            t={t}
          />
        }
        headerActionsSlot={
          <IconButton
            onClick={() => onShowRules(true)}
            title={t('games.rules.button')}
            style={{ fontSize: '1.2rem' }}
          >
            📖
          </IconButton>
        }
        onRuleComingSoonChange={state.setRuleComingSoon}
      />
    </div>
  );
});
