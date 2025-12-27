'use client';

import styled, { keyframes } from 'styled-components';
import type { GameRoomSummary } from '@/shared/types/games';
import {
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitle,
  FullscreenButton,
  StartButton,
} from './styles';

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(3deg); }
  75% { transform: translateY(-4px) rotate(-3deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

// Layout
const LobbyContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Main Center Section
const CenterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  animation: ${slideIn} 0.5s ease-out;
`;

const GameIcon = styled.div`
  font-size: 5rem;
  line-height: 1;
  animation: ${float} 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(99, 102, 241, 0.3));
`;

const LobbyTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-align: center;
`;

const LobbySubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  margin: 0;
  max-width: 400px;
`;

// Room Name Badge
const RoomNameBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

const diceRoll = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.1); }
  50% { transform: rotate(15deg) scale(1); }
  75% { transform: rotate(-5deg) scale(1.05); }
`;

const RoomNameIcon = styled.span`
  font-size: 1rem;
  display: inline-block;
  animation: ${diceRoll} 2s ease-in-out infinite;
`;

const RoomNameText = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #f59e0b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

// Progress Bar
const ProgressWrapper = styled.div`
  width: 100%;
  max-width: 300px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
`;

// Host Controls
const HostControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(236, 72, 153, 0.05)
  );
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  animation: ${slideIn} 0.6s ease-out 0.1s both;
`;

const HostLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6366f1;
`;

// Sidebar
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${slideIn} 0.5s ease-out 0.2s both;
`;

const Card = styled.div`
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    rgba(139, 92, 246, 0.04)
  );
  backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  }
`;

const CardTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0 0 1rem 0;
`;

// Player List
const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PlayerItem = styled.div<{ $isHost?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 10px;
  background: ${({ $isHost }) =>
    $isHost ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid
    ${({ $isHost }) => ($isHost ? 'rgba(99, 102, 241, 0.3)' : 'transparent')};
`;

const PlayerAvatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
  flex-shrink: 0;
`;

const PlayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlayerName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlayerBadge = styled.span`
  font-size: 0.65rem;
  padding: 0.15rem 0.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 8px;
  font-weight: 600;
`;

const EmptySlot = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px dashed rgba(99, 102, 241, 0.2);
  opacity: 0.5;
`;

const EmptyAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

// Info Row
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const InfoValue = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 500;
  background: ${({ $status }) =>
    $status === 'lobby'
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(99, 102, 241, 0.15)'};
  color: ${({ $status }) => ($status === 'lobby' ? '#10b981' : '#6366f1')};
`;

// Waiting Animation
const WaitingDots = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// Avatar colors
const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

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
  const members = room.members ?? [];
  const maxPlayers = room.maxPlayers ?? 5;
  const progress = Math.round((room.playerCount / maxPlayers) * 100);

  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.table.lobby.gameLoading');
    if (room.playerCount < 2) return t('games.table.lobby.needTwoPlayers');
    if (isHost) return t('games.table.lobby.hostCanStart');
    return t('games.table.lobby.waitingForHost');
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <RoomNameBadge>
            <RoomNameIcon>🎲</RoomNameIcon>
            <RoomNameText>{room.name}</RoomNameText>
          </RoomNameBadge>
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
        </div>
      </GameHeader>

      <LobbyContent>
        <CenterSection>
          <GameIcon>🐱💣</GameIcon>
          <LobbyTitle>{t('games.table.lobby.waitingToStart')}</LobbyTitle>
          <LobbySubtitle>{getSubtitleText()}</LobbySubtitle>

          <ProgressWrapper>
            <ProgressLabel>
              <span>{t('games.table.lobby.playersInLobby')}</span>
              <span>
                {room.playerCount} / {maxPlayers}
              </span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill $percent={progress} />
            </ProgressBar>
          </ProgressWrapper>

          <WaitingDots>
            <Dot $delay={0} />
            <Dot $delay={0.2} />
            <Dot $delay={0.4} />
          </WaitingDots>

          {isHost && room.status === 'lobby' && (
            <HostControls>
              <HostLabel>{t('games.table.lobby.hostControls')}</HostLabel>
              <StartButton
                onClick={onStartGame}
                disabled={startBusy || room.playerCount < 2}
              >
                {startBusy
                  ? t('games.table.actions.starting')
                  : t('games.table.actions.start')}
              </StartButton>
            </HostControls>
          )}
        </CenterSection>

        <Sidebar>
          <Card>
            <CardTitle>
              {t('games.table.lobby.players')} ({room.playerCount}/{maxPlayers})
            </CardTitle>
            <PlayerList>
              {members.map((member, i) => (
                <PlayerItem key={member.id} $isHost={member.id === room.hostId}>
                  <PlayerAvatar
                    $color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                  >
                    {getInitials(member.displayName)}
                  </PlayerAvatar>
                  <PlayerInfo>
                    <PlayerName>{member.displayName}</PlayerName>
                  </PlayerInfo>
                  {member.id === room.hostId && (
                    <PlayerBadge>{t('games.table.lobby.host')}</PlayerBadge>
                  )}
                </PlayerItem>
              ))}
              {Array.from({ length: Math.max(0, 2 - members.length) }).map(
                (_, i) => (
                  <EmptySlot key={`empty-${i}`}>
                    <EmptyAvatar>?</EmptyAvatar>
                    <InfoLabel>
                      {t('games.table.lobby.waitingForPlayer')}
                    </InfoLabel>
                  </EmptySlot>
                ),
              )}
            </PlayerList>
          </Card>

          <Card>
            <CardTitle>{t('games.table.lobby.roomInfo')}</CardTitle>
            <InfoRow>
              <InfoLabel>{t('games.table.lobby.status')}</InfoLabel>
              <StatusBadge $status={room.status}>
                {room.status === 'lobby'
                  ? t('games.table.lobby.statusWaiting')
                  : t('games.table.lobby.statusActive')}
              </StatusBadge>
            </InfoRow>
            <InfoRow>
              <InfoLabel>{t('games.table.lobby.visibility')}</InfoLabel>
              <InfoValue>
                {room.visibility === 'public'
                  ? `🌐 ${t('games.table.lobby.visibilityPublic')}`
                  : `🔒 ${t('games.table.lobby.visibilityPrivate')}`}
              </InfoValue>
            </InfoRow>
            {room.inviteCode && (
              <InfoRow>
                <InfoLabel>{t('games.table.lobby.inviteCode')}</InfoLabel>
                <InfoValue
                  style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                >
                  {room.inviteCode}
                </InfoValue>
              </InfoRow>
            )}
          </Card>
        </Sidebar>
      </LobbyContent>
    </GameContainer>
  );
}
