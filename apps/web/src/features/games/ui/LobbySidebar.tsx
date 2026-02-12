'use client';

import React from 'react';
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
import { Button } from '@/shared/ui';
import {
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
  FastBadge,
} from './lobbyStyles';
import { SortablePlayerItem, AVATAR_COLORS } from './SortablePlayerItem';

interface LobbySidebarProps {
  room: GameRoomSummary;
  isHost: boolean;
  minPlayers: number;
  isFastMode?: boolean;
  playersLabel: string;
  invitedPlayersLabel: string;
  declinedLabel: string;
  reinviteLabel: string;
  roomInfoLabel: string;
  statusLabel: string;
  statusWaitingLabel: string;
  statusActiveLabel: string;
  visibilityLabel: string;
  visibilityPublicLabel: string;
  visibilityPrivateLabel: string;
  inviteCodeLabel: string;
  waitingForPlayerLabel: string;
  fastRoomLabel: string;
  showReorderControls: boolean;
  showInvitedPlayers: boolean;
  members: Required<GameRoomSummary>['members'];
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  extraPlayersCardSlot?: React.ReactNode;
}

export function LobbySidebar({
  room,
  isHost,
  minPlayers,
  isFastMode,
  playersLabel,
  invitedPlayersLabel,
  declinedLabel,
  reinviteLabel,
  roomInfoLabel,
  statusLabel,
  statusWaitingLabel,
  statusActiveLabel,
  visibilityLabel,
  visibilityPublicLabel,
  visibilityPrivateLabel,
  inviteCodeLabel,
  waitingForPlayerLabel,
  fastRoomLabel,
  showReorderControls,
  showInvitedPlayers,
  members,
  onReorderPlayers,
  onReinvite,
  extraPlayersCardSlot,
}: LobbySidebarProps) {
  const maxPlayers = room.maxPlayers ?? 5;

  // Get invited/declined for rematch
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
  const joinedIds = new Set(members.map((m) => m.id));
  const pendingInvited = invitedUsers.filter((u) => !joinedIds.has(u.id));
  const pendingDeclined = declinedUsers.filter((u) => !joinedIds.has(u.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <Sidebar>
      <LobbyCard>
        <CardTitle>
          {playersLabel} ({room.playerCount}/{maxPlayers})
        </CardTitle>
        <PlayerList>
          {showReorderControls && isHost ? (
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
                    index={index}
                    totalCount={members.length}
                    onMoveUp={() => {
                      const newOrder = arrayMove(members, index, index - 1).map(
                        (m) => m.id,
                      );
                      onReorderPlayers?.(newOrder);
                    }}
                    onMoveDown={() => {
                      const newOrder = arrayMove(members, index, index + 1).map(
                        (m) => m.id,
                      );
                      onReorderPlayers?.(newOrder);
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            members.map((member) => {
              const isRoomHost = member.id === room.hostId;
              const avatarColor =
                AVATAR_COLORS[member.displayName.length % AVATAR_COLORS.length];
              return (
                <PlayerItem key={member.id} $isHost={isRoomHost}>
                  <LobbyPlayerAvatar $color={avatarColor}>
                    {getInitials(member.displayName)}
                  </LobbyPlayerAvatar>
                  <PlayerInfo>
                    <LobbyPlayerName>{member.displayName}</LobbyPlayerName>
                    {isRoomHost && <PlayerBadge>HOST</PlayerBadge>}
                  </PlayerInfo>
                </PlayerItem>
              );
            })
          )}
          {Array.from({ length: Math.max(0, minPlayers - members.length) }).map(
            (_, i) => (
              <EmptySlot key={`empty-${i}`}>
                <EmptyAvatar>?</EmptyAvatar>
                <InfoLabel>{waitingForPlayerLabel}</InfoLabel>
              </EmptySlot>
            ),
          )}
        </PlayerList>
      </LobbyCard>

      {extraPlayersCardSlot}

      {showInvitedPlayers &&
        (pendingInvited.length > 0 || pendingDeclined.length > 0) && (
          <LobbyCard>
            <CardTitle>{invitedPlayersLabel}</CardTitle>
            <PlayerList>
              {pendingInvited.map((u) => (
                <PlayerItem key={u.id} style={{ opacity: 0.7 }}>
                  <LobbyPlayerAvatar
                    $color={
                      AVATAR_COLORS[u.displayName.length % AVATAR_COLORS.length]
                    }
                    style={{ filter: 'grayscale(1)' }}
                  >
                    {getInitials(u.displayName)}
                  </LobbyPlayerAvatar>
                  <PlayerInfo>
                    <LobbyPlayerName>{u.displayName}</LobbyPlayerName>
                    <InfoLabel>Waiting...</InfoLabel>
                  </PlayerInfo>
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
                        {declinedLabel}
                      </InfoLabel>
                    </PlayerInfo>
                  </div>
                  {isHost && onReinvite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReinvite([u.id])}
                      style={{ marginLeft: '8px' }}
                    >
                      {reinviteLabel}
                    </Button>
                  )}
                </PlayerItem>
              ))}
            </PlayerList>
          </LobbyCard>
        )}

      <LobbyCard>
        <CardTitle>{roomInfoLabel}</CardTitle>
        <InfoRow>
          <InfoLabel>{statusLabel}</InfoLabel>
          <StatusBadge $status={room.status}>
            {room.status === 'lobby' ? statusWaitingLabel : statusActiveLabel}
          </StatusBadge>
        </InfoRow>
        {isFastMode && (
          <InfoRow>
            <InfoLabel>Mode</InfoLabel>
            <FastBadge>⚡ {fastRoomLabel}</FastBadge>
          </InfoRow>
        )}
        <InfoRow>
          <InfoLabel>{visibilityLabel}</InfoLabel>
          <InfoValue>
            {room.visibility === 'public'
              ? `🌐 ${visibilityPublicLabel}`
              : `🔒 ${visibilityPrivateLabel}`}
          </InfoValue>
        </InfoRow>
        {room.inviteCode && (
          <InfoRow>
            <InfoLabel>{inviteCodeLabel}</InfoLabel>
            <InfoValue
              style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
            >
              {room.inviteCode}
            </InfoValue>
          </InfoRow>
        )}
      </LobbyCard>
    </Sidebar>
  );
}
