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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  FastBadge,
  // ReorderButton, // No longer used
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
  onReorderPlayers?: (newOrder: string[]) => void;
  t: (key: string) => string;
}

function SortablePlayerItem({
  member,
  isHost,
  isRoomHost,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
}: {
  member: NonNullable<GameRoomSummary['members']>[0];
  isHost: boolean;
  isRoomHost: boolean;
  roomHostId: string;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: member.id,
    disabled: !isHost, // Only host can drag
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
    cursor: isHost ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
  const colorIndex = member.displayName.length % AVATAR_COLORS.length;

  return (
    <PlayerItem ref={setNodeRef} style={style} $isHost={isRoomHost}>
      <div
        style={{ display: 'flex', alignItems: 'center', flex: 1 }}
        {...attributes}
        {...listeners}
      >
        <LobbyPlayerAvatar $color={AVATAR_COLORS[colorIndex]}>
          {getInitials(member.displayName)}
        </LobbyPlayerAvatar>
        <PlayerInfo>
          <LobbyPlayerName>{member.displayName}</LobbyPlayerName>
        </PlayerInfo>
      </div>

      {isRoomHost && <PlayerBadge>HOST</PlayerBadge>}

      {isHost && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: 'auto',
            paddingLeft: '8px',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            style={{
              opacity: index === 0 ? 0.3 : 1,
              background: 'none',
              border: 'none',
              cursor: index === 0 ? 'default' : 'pointer',
              color: 'inherit',
              padding: '2px',
            }}
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalCount - 1}
            style={{
              opacity: index === totalCount - 1 ? 0.3 : 1,
              background: 'none',
              border: 'none',
              cursor: index === totalCount - 1 ? 'default' : 'pointer',
              color: 'inherit',
              padding: '2px',
            }}
          >
            ↓
          </button>
          <div
            style={{ opacity: 0.5, cursor: 'grab' }}
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </div>
        </div>
      )}
    </PlayerItem>
  );
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
  t,
}: GameLobbyProps) {
  const members = room.members ?? [];
  const maxPlayers = room.maxPlayers ?? 5;
  const progress = Math.round((room.playerCount / maxPlayers) * 100);

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

  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <RoomNameBadge>
            <RoomNameIcon>🎲</RoomNameIcon>
            <RoomNameText>{room.name}</RoomNameText>
          </RoomNameBadge>
          {room.gameOptions?.idleTimerEnabled && (
            <FastBadge>
              <span>⚡</span>
              <span>{t('games.rooms.fastRoom')}</span>
            </FastBadge>
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
