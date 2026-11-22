'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import {
  loadStoredSettings,
  saveStoredSettings,
} from '@/shared/lib/settings-storage';
import { gameSocket } from '@/shared/lib/socket';
import { initialBotCount, shouldStartWithBots } from './lobbyConfig';
import type {
  LobbyBotDifficulty,
  LobbyStartOptions,
} from './ReusableGameLobby.types';

interface UseLobbyBotsArgs {
  roomId: string;
  userId: string;
  roomStatus: string;
  playerCount: number;
  isHost: boolean;
  enableBots: boolean;
  minPlayers: number;
  maxPlayers: number;
  onStartGame: (options?: LobbyStartOptions) => void;
}

/** Bot count/difficulty state plus start/add/remove handlers for the lobby. */
export function useLobbyBots({
  roomId,
  userId,
  roomStatus,
  playerCount,
  isHost,
  enableBots,
  minPlayers,
  maxPlayers,
  onStartGame,
}: UseLobbyBotsArgs) {
  const { setOption } = useRoomOptions({ roomId, userId });
  const [botCount, setBotCount] = useState(() =>
    initialBotCount(minPlayers, maxPlayers),
  );
  const [difficulty, setDifficulty] = useState<LobbyBotDifficulty>(() => {
    const settings = loadStoredSettings();
    return settings.aiDifficulty ?? 'medium';
  });
  const cooldownRef = useRef(0);

  useEffect(() => {
    saveStoredSettings({ aiDifficulty: difficulty });
    if (enableBots && isHost && roomStatus === 'lobby') {
      setOption({ aiDifficulty: difficulty });
    }
  }, [difficulty, enableBots, isHost, roomStatus, setOption]);

  const handleStart = useCallback(() => {
    const now = Date.now();
    if (now - cooldownRef.current < 1000) return;
    cooldownRef.current = now;
    if (shouldStartWithBots(enableBots, playerCount)) {
      onStartGame({ withBots: true, botCount, difficulty });
    } else {
      onStartGame();
    }
  }, [enableBots, playerCount, botCount, difficulty, onStartGame]);

  const handleAddBot = useCallback(() => {
    gameSocket.emit('games.room.add_bot', { roomId, userId });
  }, [roomId, userId]);

  const handleRemoveBot = useCallback(
    (botId: string) => {
      gameSocket.emit('games.room.remove_bot', { roomId, userId, botId });
    },
    [roomId, userId],
  );

  return {
    setOption,
    botCount,
    setBotCount,
    difficulty,
    setDifficulty,
    handleStart,
    handleAddBot,
    handleRemoveBot,
  };
}
