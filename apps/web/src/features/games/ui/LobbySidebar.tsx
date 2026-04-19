'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
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
import { Button, Badge } from '@arcadeum/ui';
import {
  Sidebar,
  LobbyCard,
  CardTitle,
  PlayerList,
  PlayerItem,
  LobbyPlayerAvatar,
  PlayerInfo,
  LobbyPlayerName,
  LobbyPlayerAvatarText,
  EmptySlot,
  EmptyAvatar,
  EmptyAvatarText,
  InfoRow,
  InfoLabel,
  StatusBadge,
  InfoValue,
  FastBadge,
  FastBadgeText,
  DeleteButton,
  CardHeader,
  RefreshButton,
} from './lobbyStyles';
import { SortablePlayerItem, AVATAR_COLORS } from './SortablePlayerItem';
import { ConfirmationModal } from './ConfirmationModal';
import { RefreshIcon } from '@arcadeum/ui';

interface LobbySidebarProps {
  room: GameRoomSummary;
  isHost: boolean;
  minPlayers: number;
  isFastMode?: boolean;
  labels: {
    playersLabel?: string;
    invitedPlayersLabel?: string;
    declinedLabel?: string;
    reinviteLabel?: string;
    roomInfoLabel?: string;
    statusLabel?: string;
    visibilityLabel?: string;
    visibilityPublicLabel?: string;
    visibilityPrivateLabel?: string;
    inviteCodeLabel?: string;
    waitingForPlayerLabel?: string;
    fastRoomLabel?: string;
    deleteRoomLabel?: string;
    kickPlayerLabel?: string;
    leaveRoomLabel?: string;
  };
  showReorderControls: boolean;
  showInvitedPlayers: boolean;
  members: Required<GameRoomSummary>['members'];
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  deleteRoomLabel: string;
  extraPlayersCardSlot?: React.ReactNode;
  onRefresh?: () => void;
}

export function LobbySidebar({
  room,
  isHost,
  minPlayers,
  isFastMode,
  showReorderControls,
  showInvitedPlayers,
  members,
  onReorderPlayers,
  onReinvite,
  onDeleteRoom,
  onKickPlayer,
  onLeaveRoom,
  deleteRoomLabel,
  extraPlayersCardSlot,
  onRefresh,
  labels,
}: LobbySidebarProps) {
  const {
    playersLabel = 'Players',
    invitedPlayersLabel = 'Invited Players',
    declinedLabel = 'Declined',
    reinviteLabel = 'Re-invite',
    roomInfoLabel = 'Room Info',
    statusLabel = 'Status',
    visibilityLabel = 'Visibility',
    visibilityPublicLabel = 'Public',
    visibilityPrivateLabel = 'Private',
    inviteCodeLabel = 'Invite Code',
    waitingForPlayerLabel = 'Waiting for player...',
    fastRoomLabel = 'Fast Room',
  } = labels;
  const { t } = useTranslation();
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

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const [kickTarget, setKickTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);

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

  return (
    <Sidebar>
      <LobbyCard>
        <CardHeader>
          <CardTitle>
            {playersLabel} ({room.playerCount}/{maxPlayers})
          </CardTitle>
          {onRefresh && (
            <RefreshButton
              onClick={onRefresh}
              onPress={onRefresh}
              title="Refresh Room"
              data-testid="refresh-room-button"
            >
              <RefreshIcon size={16} />
            </RefreshButton>
          )}
        </CardHeader>
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
                    onKick={
                      onKickPlayer && member.id !== room.hostId
                        ? () =>
                            setKickTarget({
                              id: member.id,
                              name: member.displayName,
                            })
                        : undefined
                    }
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
                  <LobbyPlayerAvatar backgroundColor={avatarColor}>
                    <LobbyPlayerAvatarText>
                      {getInitials(member.displayName)}
                    </LobbyPlayerAvatarText>
                  </LobbyPlayerAvatar>
                  <PlayerInfo>
                    <LobbyPlayerName>{member.displayName}</LobbyPlayerName>
                    {isRoomHost && (
                      <Badge variant="info" size="sm">
                        HOST
                      </Badge>
                    )}
                  </PlayerInfo>
                  {onKickPlayer && !isRoomHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setKickTarget({
                          id: member.id,
                          name: member.displayName,
                        })
                      }
                      onPress={() =>
                        setKickTarget({
                          id: member.id,
                          name: member.displayName,
                        })
                      }
                      paddingVertical="$1"
                      paddingHorizontal="$2"
                      minWidth="auto"
                      style={{ color: '#ef4444' }}
                    >
                      ✕
                    </Button>
                  )}
                </PlayerItem>
              );
            })
          )}
          {Array.from({ length: Math.max(0, minPlayers - members.length) }).map(
            (_, i) => (
              <EmptySlot key={`empty-${i}`}>
                <EmptyAvatar>
                  <EmptyAvatarText>?</EmptyAvatarText>
                </EmptyAvatar>
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
                    backgroundColor={
                      AVATAR_COLORS[u.displayName.length % AVATAR_COLORS.length]
                    }
                    style={{ filter: 'grayscale(1)' }}
                  >
                    <LobbyPlayerAvatarText>
                      {getInitials(u.displayName)}
                    </LobbyPlayerAvatarText>
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
                      backgroundColor="#ccc"
                      style={{ filter: 'grayscale(1)' }}
                    >
                      <LobbyPlayerAvatarText>
                        {getInitials(u.displayName)}
                      </LobbyPlayerAvatarText>
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
                      onClick={() => onReinvite?.([u.id])}
                      onPress={() => onReinvite?.([u.id])}
                      marginLeft="$2"
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
            {t(`games.rooms.status.${room.status}`) || room.status}
          </StatusBadge>
        </InfoRow>
        {isFastMode && (
          <InfoRow>
            <InfoLabel>Mode</InfoLabel>
            <FastBadge>
              <FastBadgeText>⚡ {fastRoomLabel}</FastBadgeText>
            </FastBadge>
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

      {isHost && onDeleteRoom && (
        <DeleteButton
          onClick={onDeleteRoom}
          onPress={onDeleteRoom}
          marginTop="$2"
          width="100%"
        >
          {deleteRoomLabel}
        </DeleteButton>
      )}

      {!isHost && onLeaveRoom && (
        <DeleteButton
          onClick={() => setShowLeaveConfirm(true)}
          onPress={() => setShowLeaveConfirm(true)}
          marginTop="$2"
          width="100%"
        >
          {labels.leaveRoomLabel || t('games.common.leaveRoom.button')}
        </DeleteButton>
      )}

      <ConfirmationModal
        open={!!kickTarget}
        onClose={() => setKickTarget(null)}
        onConfirm={() => {
          if (kickTarget) {
            onKickPlayer?.(kickTarget.id);
            setKickTarget(null);
          }
        }}
        title={t('games.common.kickPlayer.confirmTitle')}
        message={t('games.common.kickPlayer.confirmMessage', {
          playerName: kickTarget?.name ?? '',
        })}
        confirmLabel={t('games.common.kickPlayer.confirmButton')}
        cancelLabel={t('games.common.kickPlayer.cancelButton')}
      />

      <ConfirmationModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={onLeaveRoom}
        title={t('games.common.leaveRoom.confirmTitle')}
        message={t('games.common.leaveRoom.confirmMessage')}
        confirmLabel={t('games.common.leaveRoom.confirmButton')}
        cancelLabel={t('games.common.leaveRoom.cancelButton')}
      />
    </Sidebar>
  );
}
