'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import {
  LobbyCard,
  CardTitle,
  InfoRow,
  InfoLabel,
  StatusBadge,
  InfoValue,
  FastBadge,
  FastBadgeText,
} from './lobbyStyles';
import { InviteFriendPicker } from './InviteFriendPicker';

export interface LobbySidebarRoomInfoProps {
  room: GameRoomSummary;
  isHost: boolean;
  isFastMode?: boolean;
  roomInfoLabel: string;
  statusLabel: string;
  visibilityLabel: string;
  visibilityPublicLabel: string;
  visibilityPrivateLabel: string;
  inviteCodeLabel: string;
  fastRoomLabel: string;
  notesLabel?: string;
}

export function LobbySidebarRoomInfo({
  room,
  isHost,
  isFastMode,
  roomInfoLabel,
  statusLabel,
  visibilityLabel,
  visibilityPublicLabel,
  visibilityPrivateLabel,
  inviteCodeLabel,
  fastRoomLabel,
  notesLabel,
}: LobbySidebarRoomInfoProps) {
  const { t } = useTranslation();
  return (
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
          <InfoLabel>{notesLabel || 'Notes'}</InfoLabel>
          <InfoValue className="text-xs break-words max-w-[180px] text-right">
            {room.notes}
          </InfoValue>
        </InfoRow>
      ) : null}

      {isHost && room.status === 'lobby' && (
        <InviteFriendPicker roomId={room.id} />
      )}
    </LobbyCard>
  );
}
