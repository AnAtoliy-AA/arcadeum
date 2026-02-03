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
  onStartGame: () => void;
  onReorderPlayers?: (newOrder: string[]) => void;
}

export function SeaBattleLobby({
  room,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
}: SeaBattleLobbyProps) {
  const currentVariant = (room.gameOptions?.variant as string) || 'classic';
  const theme = getSeaBattleTheme(currentVariant);
  const variantInfo = getVariantInfo(currentVariant);

  const optionsSlot =
    isHost && room.status === 'lobby' ? (
      <VariantSelectorWrapper>
        <VariantSelector roomId={room.id} currentVariant={currentVariant} />
      </VariantSelectorWrapper>
    ) : null;

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
      waitingLabel="Waiting for sailors..."
      playersLabel="Sailors"
      hostControlsLabel="Captain's Orders"
      startLabel="Launch Battle!"
      startingLabel="Launching..."
      roomInfoLabel="Ship Info"
      fastRoomLabel="Speed Mode"
      theme={theme}
      showReorderControls={true}
      showInvitedPlayers={false}
      optionsSlot={optionsSlot}
    />
  );
}
