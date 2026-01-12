'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { GameRoomSummary } from '@/shared/types/games';
import { SortablePlayerItem } from './LobbyPlayerItem';
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
  EmptySlot,
  EmptyAvatar,
  InfoRow,
  InfoLabel,
  StatusBadge,
  InfoValue,
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
  FastBadge,
  VariantSelectorWrapper,
  // ReorderButton, // No longer used
} from './styles/lobby';
import { CARD_VARIANTS, RANDOM_VARIANT } from '../lib/constants';
import { VariantSelector } from './VariantSelector';

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
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
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
  onReorderPlayers,
  onReinvite,
  t,
}: GameLobbyProps) {
  const members = room.members ?? [];
  const maxPlayers = room.maxPlayers ?? 5;
  const progress = Math.round((room.playerCount / maxPlayers) * 100);

  // Extract invited and declined users from room root (fallback to gameOptions)
  const invitedUsers =
    room.rematchInvitedUsers ||
    (room.gameOptions?.rematchInvitedUsers as Array<{
      id: string;
      displayName: string;
    }>) ||
    [];
  const declinedUsers =
    room.rematchDeclinedUsers ||
    (room.gameOptions?.rematchDeclinedUsers as Array<{
      id: string;
      displayName: string;
    }>) ||
    [];

  // Filter out users who have already joined
  // Filter out users who have already joined
  const joinedIds = new Set(members.map((m) => m.id));
  const pendingInvited = invitedUsers.filter((u) => !joinedIds.has(u.id));
  const pendingDeclined = declinedUsers.filter((u) => !joinedIds.has(u.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = members.findIndex((m) => m.id === active.id);
      const newIndex = members.findIndex((m) => m.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(members, oldIndex, newIndex).map(
          (m) => m.id,
        );
        onReorderPlayers?.(newOrder);
      }
    }
  };

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
          <GameTitle>
            Critical
            <span
              style={{
                background: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '0.8em',
              }}
            >
              :{' '}
              {room.gameOptions?.cardVariant === 'random'
                ? RANDOM_VARIANT.name
                : CARD_VARIANTS.find(
                    (v) => v.id === room.gameOptions?.cardVariant,
                  )?.name || 'Classic'}
            </span>
          </GameTitle>
          <RoomNameBadge>
            <RoomNameIcon>
              {room.gameOptions?.cardVariant === 'random'
                ? RANDOM_VARIANT.emoji
                : CARD_VARIANTS.find(
                    (v) => v.id === room.gameOptions?.cardVariant,
                  )?.emoji || '🎲'}
            </RoomNameIcon>
            <RoomNameText>{room.name}</RoomNameText>
          </RoomNameBadge>
          {room.gameOptions?.idleTimerEnabled && (
            <FastBadge>
              <span>⚡</span>
              <span>{t('games.rooms.fastRoom')}</span>
            </FastBadge>
          )}

          {isHost && room.status === 'lobby' && (
            <VariantSelectorWrapper>
              <VariantSelector
                roomId={room.id}
                currentVariant={room.gameOptions?.cardVariant || 'cyberpunk'}
              />
            </VariantSelectorWrapper>
          )}
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={members.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {members.map((member, index) => (
                    <SortablePlayerItem
                      key={member.id}
                      member={member}
                      isHost={isHost}
                      isRoomHost={member.id === room.hostId}
                      roomHostId={room.hostId}
                      index={index}
                      totalCount={members.length}
                      onMoveUp={() => {
                        const newOrder = arrayMove(
                          members,
                          index,
                          index - 1,
                        ).map((m) => m.id);
                        onReorderPlayers?.(newOrder);
                      }}
                      onMoveDown={() => {
                        const newOrder = arrayMove(
                          members,
                          index,
                          index + 1,
                        ).map((m) => m.id);
                        onReorderPlayers?.(newOrder);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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

          {/* Invited / Declined Section */}
          {(pendingInvited.length > 0 || pendingDeclined.length > 0) && (
            <LobbyCard>
              <CardTitle>{t('games.table.lobby.invitedPlayers')}</CardTitle>
              <PlayerList>
                {pendingInvited.map((u) => (
                  <PlayerItem key={u.id} style={{ opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <LobbyPlayerAvatar
                        $color={
                          AVATAR_COLORS[
                            u.displayName.length % AVATAR_COLORS.length
                          ]
                        }
                        style={{ filter: 'grayscale(1)' }}
                      >
                        {getInitials(u.displayName)}
                      </LobbyPlayerAvatar>
                      <PlayerInfo>
                        <LobbyPlayerName>{u.displayName}</LobbyPlayerName>
                        <InfoLabel>
                          {t('games.table.lobby.statusWaiting')}
                        </InfoLabel>
                      </PlayerInfo>
                    </div>
                  </PlayerItem>
                ))}
                {pendingDeclined.map((u) => (
                  <PlayerItem key={u.id} style={{ opacity: 0.5 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                    >
                      <LobbyPlayerAvatar
                        $color="#ccc"
                        style={{ filter: 'grayscale(1)' }}
                      >
                        {getInitials(u.displayName)}
                      </LobbyPlayerAvatar>
                      <PlayerInfo>
                        <LobbyPlayerName
                          style={{ textDecoration: 'line-through' }}
                        >
                          {u.displayName}
                        </LobbyPlayerName>
                        <InfoLabel style={{ color: '#ef4444' }}>
                          {t('games.table.lobby.statusDeclined')}
                        </InfoLabel>
                      </PlayerInfo>
                    </div>
                    {isHost && onReinvite && (
                      <button
                        onClick={() => onReinvite([u.id])}
                        style={{
                          background: 'none',
                          border: '1px solid currentColor',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          marginLeft: '8px',
                          color: 'inherit',
                        }}
                      >
                        {t('games.table.lobby.reinvite')}
                      </button>
                    )}
                  </PlayerItem>
                ))}
              </PlayerList>
            </LobbyCard>
          )}

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
            {room.gameOptions?.idleTimerEnabled && (
              <InfoRow>
                <InfoLabel>{t('games.rooms.fastRoom')}</InfoLabel>
                <FastBadge>⚡ {t('games.rooms.fastRoom')}</FastBadge>
              </InfoRow>
            )}
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
