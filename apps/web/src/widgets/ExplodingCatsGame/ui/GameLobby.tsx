'use client';

import type { GameRoomSummary } from '@/shared/types/games';
import {
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitle,
  TurnStatus,
  FullscreenButton,
  StartButton,
  EmptyState,
} from './styles';

interface GameLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  startBusy: boolean;
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggleFullscreen: () => void;
  onStartGame: () => void;
  t: (key: string) => string;
}

export function GameLobby({
  room,
  isHost,
  startBusy,
  isFullscreen,
  containerRef,
  onToggleFullscreen,
  onStartGame,
  t,
}: GameLobbyProps) {
  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <TurnStatus>
            {room.playerCount}{' '}
            {t('games.table.lobby.playersInLobby') || 'players in lobby'}
          </TurnStatus>
        </GameInfo>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <FullscreenButton
            onClick={onToggleFullscreen}
            title={
              isFullscreen
                ? t('games.table.fullscreen.exit') || 'Exit fullscreen'
                : t('games.table.fullscreen.enter') || 'Enter fullscreen'
            }
          >
            {isFullscreen ? '⤓' : '⤢'}
          </FullscreenButton>
          {isHost && room.status === 'lobby' && (
            <StartButton
              onClick={onStartGame}
              disabled={startBusy || room.playerCount < 2}
            >
              {startBusy
                ? t('games.table.actions.starting') || 'Starting...'
                : t('games.table.actions.start') || 'Start Game'}
            </StartButton>
          )}
        </div>
      </GameHeader>
      <EmptyState>
        <div style={{ fontSize: '3rem' }}>🎮</div>
        <div>
          <strong>
            {t('games.table.lobby.waitingToStart') ||
              'Waiting for game to start...'}
          </strong>
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          {room.status !== 'lobby'
            ? 'Game is loading...'
            : room.playerCount < 2
              ? t('games.table.lobby.needTwoPlayers') ||
                'Need at least 2 players to start'
              : isHost
                ? t('games.table.lobby.hostCanStart') ||
                  "Click 'Start Game' when ready"
                : t('games.table.lobby.waitingForHost') ||
                  'Waiting for host to start the game'}
        </div>
      </EmptyState>
    </GameContainer>
  );
}
