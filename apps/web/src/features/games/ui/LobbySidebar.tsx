'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
import { Button, Badge, RefreshIcon } from '@arcadeum/ui';
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
import { InGameAvatar } from './InGameAvatar';
import { InviteFriendPicker } from './InviteFriendPicker';

interface LobbySidebarProps {
  room: GameRoomSummary;
  isHost: boolean;
  minPlayers: number;
  isFastMode?: boolean;
  className?: string;
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
    notesLabel?: string;
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
  enableBots?: boolean;
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
}

export function LobbySidebar({
  room,
  isHost,
  minPlayers,
  isFastMode,
  className,
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
  enableBots,
  onAddBot,
  onRemoveBot,
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
  const hasBotsInRoom = members.some((m) => m.id.startsWith('bot-'));
  const canAddBots =
    enableBots && isHost && room.status === 'lobby' && !hasBotsInRoom;
  const canRemoveBots = enableBots && isHost && room.status === 'lobby';

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
  const [kickTarget, setKickTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);
  const handleKickClose = React.useCallback(() => {
    setKickTarget(null);
  }, [setKickTarget]);
  const handleKickConfirm = React.useCallback(() => {
    if (kickTarget) {
      onKickPlayer?.(kickTarget.id);
      setKickTarget(null);
    }
  }, [kickTarget, onKickPlayer, setKickTarget]);

  const handleLeaveConfirm = React.useCallback(() => {
    onLeaveRoom?.();
    setShowLeaveConfirm(false);
  }, [onLeaveRoom, setShowLeaveConfirm]);
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
    <Sidebar className={className}>
      <LobbyCard>
        <CardHeader>
          <CardTitle data-testid="player-count-heading">
            {playersLabel} ({room.playerCount}/{maxPlayers})
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {canAddBots && onAddBot && (
              <Button
                className="py-1 px-2 min-w-[auto] text-[11px] font-semibold"
                variant="ghost"
                size="sm"
                onClick={onAddBot}
                data-testid="add-bot-button"
              >
                + 🤖
              </Button>
            )}
            {onRefresh && (
              <RefreshButton
                onClick={onRefresh}
                title="Refresh Room"
                data-testid="refresh-room-button"
              >
                <RefreshIcon size={16} />
              </RefreshButton>
            )}
          </div>
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
                {members.map((member, index) => {
                  const isBot = member.id.startsWith('bot-');
                  return (
                    <SortablePlayerItem
                      key={member.id}
                      member={member}
                      isHost={isHost}
                      isRoomHost={member.id === room.hostId}
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
                      onKick={
                        isBot && canRemoveBots && onRemoveBot
                          ? () => onRemoveBot(member.id)
                          : onKickPlayer && member.id !== room.hostId
                            ? () =>
                                setKickTarget({
                                  id: member.id,
                                  name: member.displayName,
                                })
                            : undefined
                      }
                      isBot={isBot}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          ) : (
            members.map((member) => {
              const isRoomHost = member.id === room.hostId;
              const isBot = member.id.startsWith('bot-');
              return (
                <PlayerItem key={member.id} isHost={isRoomHost}>
                  <InGameAvatar
                    playerId={member.id}
                    name={member.displayName}
                    size="sm"
                  />
                  <PlayerInfo>
                    <div className="flex flex-row flex-wrap items-center gap-1.5 min-w-0">
                      <LobbyPlayerName
                        className="break-words"
                        title={member.displayName}
                      >
                        {member.displayName}
                      </LobbyPlayerName>
                      {isRoomHost && (
                        <Badge variant="info" className="shrink-0">
                          HOST
                        </Badge>
                      )}
                      {isBot && (
                        <span className="text-[11px]" title="AI Bot">
                          🤖
                        </span>
                      )}
                    </div>
                  </PlayerInfo>
                  {isBot && canRemoveBots && onRemoveBot ? (
                    <Button
                      className="py-1 px-2 min-w-[auto] shrink-0 ml-auto"
                      variant="danger"
                      ghost
                      size="sm"
                      onClick={() => onRemoveBot(member.id)}
                      data-testid={`remove-bot-${member.id}`}
                    >
                      ✕
                    </Button>
                  ) : onKickPlayer && !isRoomHost ? (
                    <Button
                      className="py-1 px-2 min-w-[auto] shrink-0 ml-auto"
                      variant="danger"
                      ghost
                      size="sm"
                      onClick={() =>
                        setKickTarget({
                          id: member.id,
                          name: member.displayName,
                        })
                      }
                    >
                      ✕
                    </Button>
                  ) : null}
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
                <PlayerItem key={u.id} className="opacity-70">
                  <LobbyPlayerAvatar
                    className="grayscale"
                    backgroundColor={
                      AVATAR_COLORS[u.displayName.length % AVATAR_COLORS.length]
                    }
                  >
                    <LobbyPlayerAvatarText>
                      {u.displayName.slice(0, 2).toUpperCase()}
                    </LobbyPlayerAvatarText>
                  </LobbyPlayerAvatar>
                  <PlayerInfo>
                    <LobbyPlayerName>{u.displayName}</LobbyPlayerName>
                    <InfoLabel>Waiting...</InfoLabel>
                  </PlayerInfo>
                </PlayerItem>
              ))}
              {pendingDeclined.map((u) => (
                <PlayerItem key={u.id} className="opacity-50">
                  <div className="flex flex-1 items-center">
                    <LobbyPlayerAvatar
                      backgroundColor="#ccc"
                      className="grayscale"
                    >
                      <LobbyPlayerAvatarText>
                        {u.displayName.slice(0, 2).toUpperCase()}
                      </LobbyPlayerAvatarText>
                    </LobbyPlayerAvatar>
                    <PlayerInfo>
                      <LobbyPlayerName className="line-through">
                        {u.displayName}
                      </LobbyPlayerName>
                      <InfoLabel className="text-[#ef4444]">
                        {declinedLabel}
                      </InfoLabel>
                    </PlayerInfo>
                  </div>
                  {isHost && onReinvite && (
                    <Button
                      className="ml-2"
                      variant="ghost"
                      size="sm"
                      onClick={() => onReinvite?.([u.id])}
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
          <StatusBadge status={room.status}>
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
            <InfoValue className="font-mono tracking-[1px]">
              {room.inviteCode}
            </InfoValue>
          </InfoRow>
        )}
        {room.notes ? (
          <InfoRow>
            <InfoLabel>{labels.notesLabel || 'Notes'}</InfoLabel>
            <InfoValue className="text-xs break-words max-w-[180px] text-right">
              {room.notes}
            </InfoValue>
          </InfoRow>
        ) : null}

        {isHost && room.status === 'lobby' && (
          <InviteFriendPicker roomId={room.id} />
        )}
      </LobbyCard>

      {isHost && onDeleteRoom && (
        <DeleteButton
          onClick={onDeleteRoom}
          size="md"
          className="mt-2 shadow-none"
        >
          {deleteRoomLabel}
        </DeleteButton>
      )}

      {!isHost && onLeaveRoom && (
        <DeleteButton
          onClick={() => setShowLeaveConfirm(true)}
          size="md"
          style={{ marginTop: 8, boxShadow: '0 0px 0px transparent' }}
        >
          {labels.leaveRoomLabel || t('games.common.leaveRoom.button')}
        </DeleteButton>
      )}

      <ConfirmationModal
        open={!!kickTarget}
        onClose={handleKickClose}
        onConfirm={handleKickConfirm}
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
        onConfirm={handleLeaveConfirm}
        title={t('games.common.leaveRoom.confirmTitle')}
        message={t('games.common.leaveRoom.confirmMessage')}
        confirmLabel={t('games.common.leaveRoom.confirmButton')}
        cancelLabel={t('games.common.leaveRoom.cancelButton')}
      />
    </Sidebar>
  );
}
