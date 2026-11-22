'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LobbyStickyStart, StartButton } from './lobbyStyles';
import { getLobbyStartHint } from './lobbyConfig';

const HINT_KEYS = {
  startingHint: 'games.lobby.startingHint',
  startHintReady: 'games.lobby.startHintReady',
  startHintNeedMore: 'games.lobby.startHintNeedMore',
  startHintNeedBots: 'games.lobby.startHintNeedBots',
  subtitleNeedPlayers: 'games.lobby.subtitleNeedPlayers',
} as const;

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
  const { t } = useTranslation();
  const canStartWithBots = enableBots && playerCount === 1;
  const notEnoughPlayers = playerCount < minPlayers && !canStartWithBots;
  const hint = getLobbyStartHint({
    busy: startBusy,
    disabled: startDisabled,
    enableBots,
    playerCount,
    minPlayers,
  });

  const label = startBusy
    ? startingLabel
    : canStartWithBots
      ? startWithBotsLabel.replace('{{count}}', botCount.toString())
      : startLabel;

  return (
    <LobbyStickyStart>
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-1.5">
        <StartButton
          onClick={onStart}
          disabled={startBusy || startDisabled || notEnoughPlayers}
          className="min-h-[48px] w-full"
          data-testid="start-with-bots-button"
        >
          {label}
        </StartButton>
        <p
          id="lobby-start-hint"
          data-testid="lobby-start-hint"
          role="status"
          className="text-center text-xs text-[var(--textSecondary)]"
        >
          {t(HINT_KEYS[hint.key], { count: hint.count ?? 0 })}
        </p>
      </div>
    </LobbyStickyStart>
  );
}
