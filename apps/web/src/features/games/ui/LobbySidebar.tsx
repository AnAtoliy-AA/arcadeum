'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { Sidebar, DeleteButton } from './lobbyStyles';
import { ConfirmationModal } from './ConfirmationModal';
import { LobbySidebarPlayers } from './LobbySidebarPlayers';
import { LobbySidebarInvited, type RematchUser } from './LobbySidebarInvited';
import { LobbySidebarRoomInfo } from './LobbySidebarRoomInfo';

interface LobbySidebarProps {
  room: GameRoomSummary;
  userId?: string;
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
  userId,
  isHost,
  minPlayers,
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
  const { t } = useTranslation();
  const {
    playersLabel = t('games.lobby.playersTitle'),
    invitedPlayersLabel = t('games.lobby.invitedPlayersTitle'),
    declinedLabel = t('games.lobby.declinedLabel'),
    reinviteLabel = t('games.lobby.reinviteLabel'),
    roomInfoLabel = t('games.lobby.roomInfoTitle'),
    visibilityLabel = t('games.lobby.visibilityLabel'),
    visibilityPublicLabel = t('games.lobby.visibilityPublic'),
    visibilityPrivateLabel = t('games.lobby.visibilityPrivate'),
    waitingForPlayerLabel = t('games.lobby.waitingForPlayerSlot'),
  } = labels;
  const hasBotsInRoom = members.some((m) => m.id.startsWith('bot-'));
  const canAddBots =
    !!enableBots && isHost && room.status === 'lobby' && !hasBotsInRoom;
  const canRemoveBots = !!enableBots && isHost && room.status === 'lobby';

  // Get invited/declined for rematch
  const invitedUsers =
    room.rematchInvitedUsers ||
    (room.gameOptions?.rematchInvitedUsers as RematchUser[]) ||
    [];
  const declinedUsers =
    room.rematchDeclinedUsers ||
    (room.gameOptions?.rematchDeclinedUsers as RematchUser[]) ||
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

  const scrollToInvite = React.useCallback(() => {
    const el = document.getElementById('lobby-invite-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector<HTMLElement>('button')?.focus();
  }, []);

  return (
    <Sidebar className={className}>
      <LobbySidebarPlayers
        room={room}
        isHost={isHost}
        minPlayers={minPlayers}
        members={members}
        showReorderControls={showReorderControls}
        canAddBots={canAddBots}
        canRemoveBots={canRemoveBots}
        playersLabel={playersLabel}
        waitingForPlayerLabel={waitingForPlayerLabel}
        onReorderPlayers={onReorderPlayers}
        onKickPlayer={onKickPlayer}
        onRequestKick={setKickTarget}
        onRefresh={onRefresh}
        onAddBot={onAddBot}
        onRemoveBot={onRemoveBot}
        userId={userId}
        onInvite={
          isHost && room.status === 'lobby' ? scrollToInvite : undefined
        }
      />

      {extraPlayersCardSlot}

      {showInvitedPlayers &&
        (pendingInvited.length > 0 || pendingDeclined.length > 0) && (
          <LobbySidebarInvited
            pendingInvited={pendingInvited}
            pendingDeclined={pendingDeclined}
            isHost={isHost}
            invitedPlayersLabel={invitedPlayersLabel}
            declinedLabel={declinedLabel}
            reinviteLabel={reinviteLabel}
            onReinvite={onReinvite}
          />
        )}

      <LobbySidebarRoomInfo
        room={room}
        isHost={isHost}
        roomInfoLabel={roomInfoLabel}
        visibilityLabel={visibilityLabel}
        visibilityPublicLabel={visibilityPublicLabel}
        visibilityPrivateLabel={visibilityPrivateLabel}
        notesLabel={labels.notesLabel ?? t('games.lobby.notesLabel')}
      />

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
          className="mt-2 shadow-none"
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
