'use client';

import styled, { keyframes } from 'styled-components';
import type { GameRoomSummary } from '@/shared/types/games';
import {
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitle,
  TurnStatus,
  FullscreenButton,
  StartButton,
} from './styles';

// Styled components for the waiting screen
const WaitingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 1.5rem;
  padding: 3rem;
`;

const iconBreathing = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  line-height: 1;
  animation: ${iconBreathing} 2s ease-in-out infinite;
`;

const WaitingTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
`;

const WaitingSubtitle = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
`;

const dotPulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  animation: ${dotPulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

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
  const getSubtitleText = () => {
    if (room.status !== 'lobby') {
      return 'Game is loading...';
    }
    if (room.playerCount < 2) {
      return t('games.table.lobby.needTwoPlayers');
    }
    if (isHost) {
      return t('games.table.lobby.hostCanStart');
    }
    return t('games.table.lobby.waitingForHost');
  };

  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <TurnStatus>
            {room.playerCount} {t('games.table.lobby.playersInLobby')}
          </TurnStatus>
        </GameInfo>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <FullscreenButton
            onClick={onToggleFullscreen}
            title={
              isFullscreen
                ? t('games.table.fullscreen.exit')
                : t('games.table.fullscreen.enter')
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
                ? t('games.table.actions.starting')
                : t('games.table.actions.start')}
            </StartButton>
          )}
        </div>
      </GameHeader>

      <WaitingContainer>
        <IconWrapper>🎮</IconWrapper>
        <WaitingTitle>{t('games.table.lobby.waitingToStart')}</WaitingTitle>
        <WaitingSubtitle>{getSubtitleText()}</WaitingSubtitle>
        <DotsContainer>
          <Dot $delay={0} />
          <Dot $delay={0.2} />
          <Dot $delay={0.4} />
        </DotsContainer>
      </WaitingContainer>
    </GameContainer>
  );
}
