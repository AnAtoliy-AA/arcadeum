'use client';

import React from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';

const SEA_BATTLE_THEME: GameLobbyTheme = {
  titleGradient:
    'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1abc9c 100%)',
  variantGradient: 'linear-gradient(135deg, #3498db 0%, #1abc9c 100%)',
  buttonGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
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
  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={startBusy}
      onStartGame={onStartGame}
      onReorderPlayers={onReorderPlayers}
      gameName="Sea Battle"
      gameIcon="🚢"
      roomIcon="⚓"
      minPlayers={MIN_PLAYERS}
      waitingLabel="Waiting for sailors..."
      playersLabel="Sailors"
      hostControlsLabel="Captain's Orders"
      startLabel="Launch Battle!"
      startingLabel="Launching..."
      roomInfoLabel="Ship Info"
      fastRoomLabel="Speed Mode"
      theme={SEA_BATTLE_THEME}
      showReorderControls={true}
      showInvitedPlayers={false}
    />
  );
}
