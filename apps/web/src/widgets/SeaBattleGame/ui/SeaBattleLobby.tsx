'use client';

import React from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { VariantSelector } from './VariantSelector';
import styled from 'styled-components';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { IconButton } from '@/features/games/ui/ReusableGameLobby';
// RulesModal is handled by the parent Game component via GameLayout.modals

const VariantSelectorWrapper = styled.div`
  margin-left: 1rem;
`;

const getSeaBattleTheme = (variantId?: string): GameLobbyTheme => {
  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
  const gradient =
    variant?.gradient ||
    'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1abc9c 100%)';

  return {
    titleGradient: gradient,
    variantGradient: gradient,
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
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onShowRules: (show: boolean) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function SeaBattleLobby({
  room,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onShowRules,
  t,
}: SeaBattleLobbyProps) {
  const currentVariant = (room.gameOptions?.variant as string) || 'classic';
  const theme = getSeaBattleTheme(currentVariant);
  const variantInfo = getVariantInfo(currentVariant);

  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.roomPage.errors.loadingRoom');
    if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
    if (room.playerCount < MIN_PLAYERS)
      return t('games.table.lobby.needTwoPlayers');
    if (isHost) return t('games.table.lobby.hostCanStart');
    return t('games.table.lobby.waitingForHost');
  };

  const optionsSlot =
    isHost && room.status === 'lobby' ? (
      <VariantSelectorWrapper>
        <VariantSelector roomId={room.id} currentVariant={currentVariant} />
      </VariantSelectorWrapper>
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

  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={startBusy}
      onStartGame={onStartGame}
      onReorderPlayers={onReorderPlayers}
      gameName="Sea Battle"
      gameIcon="🚢"
      roomIcon={variantInfo.emoji || '⚓'}
      variantName={variantInfo.name}
      minPlayers={MIN_PLAYERS}
      waitingLabel={t('games.seaBattle.table.lobby.waitingToStart')}
      subtitleText={getSubtitleText()}
      playersLabel={t('games.rooms.playersLabel')}
      hostControlsLabel={t('games.seaBattle.table.lobby.hostControls')}
      startLabel={t('games.seaBattle.table.actions.start')}
      startingLabel={t('games.seaBattle.table.actions.starting')}
      roomInfoLabel={t('games.seaBattle.table.lobby.roomInfo')}
      fastRoomLabel={t('games.rooms.fastRoom')}
      botCountLabel={t('games.lobby.botCountLabel')}
      startWithBotsLabel={t('games.lobby.startWithBots')}
      theme={theme}
      showReorderControls={true}
      showInvitedPlayers={false}
      optionsSlot={optionsSlot}
      headerActionsSlot={headerActionsSlot}
      enableBots={true}
    />
  );
}
