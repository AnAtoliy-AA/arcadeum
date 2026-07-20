'use client';

import React from 'react';
import { LobbyStickyStart, StartButton } from './lobbyStyles';

interface LobbyStartButtonProps {
  startBusy: boolean;
  startDisabled: boolean;
  enableBots: boolean;
  playerCount: number;
  minPlayers: number;
  botCount: number;
  startLabel: string;
  startingLabel: string;
  startWithBotsLabel: string;
  onStart: () => void;
}

export function LobbyStartButton({
  startBusy,
  startDisabled,
  enableBots,
  playerCount,
  minPlayers,
  botCount,
  startLabel,
  startingLabel,
  startWithBotsLabel,
  onStart,
}: LobbyStartButtonProps) {
  const canStartWithBots = enableBots && playerCount === 1;
  const notEnoughPlayers =
    playerCount < minPlayers && !canStartWithBots;

  const label = startBusy
    ? startingLabel
    : canStartWithBots
      ? startWithBotsLabel.replace('{{count}}', botCount.toString())
      : startLabel;

  return (
    <LobbyStickyStart>
      <StartButton
        onClick={onStart}
        disabled={startBusy || startDisabled || notEnoughPlayers}
        data-testid="start-with-bots-button"
      >
        {label}
      </StartButton>
    </LobbyStickyStart>
  );
}
