'use client';

import type { GameRoomSummary } from '@/shared/types/games';
import {
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitle,
  FullscreenButton,
  StartButton,
} from './styles';
import {
  LobbyContent,
  CenterSection,
  GameIcon,
  LobbyTitle,
  LobbySubtitle,
  ProgressWrapper,
  ProgressLabel,
  ProgressBar,
  ProgressFill,
  WaitingDots,
  Dot,
  HostControls,
  HostLabel,
  Sidebar,
  LobbyCard,
  CardTitle,
  PlayerList,
  PlayerItem,
  LobbyPlayerAvatar,
  PlayerInfo,
  LobbyPlayerName,
  PlayerBadge,
  EmptySlot,
  EmptyAvatar,
  InfoRow,
  InfoLabel,
  StatusBadge,
  InfoValue,
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
} from './styles/lobby';

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
          <LobbyCard>
            <CardTitle>
              {t('games.table.lobby.players')} ({room.playerCount}/{maxPlayers})
            </CardTitle>
            <PlayerList>
              {members.map((member, i) => (
                <PlayerItem key={member.id} $isHost={member.id === room.hostId}>
                  <LobbyPlayerAvatar
                    $color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                  >
                    {getInitials(member.displayName)}
                  </LobbyPlayerAvatar>
                  <PlayerInfo>
                    <LobbyPlayerName>{member.displayName}</LobbyPlayerName>
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
          </LobbyCard>

          <LobbyCard>
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
          </LobbyCard>
        </Sidebar>
      </LobbyContent>
    </GameContainer>
  );
}
