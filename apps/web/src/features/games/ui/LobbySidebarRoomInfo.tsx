'use client';

import type { GameRoomSummary } from '@/shared/types/games';
import {
  LobbyCard,
  CardTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
} from './lobbyStyles';
import { InviteFriendPicker } from './InviteFriendPicker';

export interface LobbySidebarRoomInfoProps {
  room: GameRoomSummary;
  isHost: boolean;
  /** @deprecated Shown in the header now. */
  isFastMode?: boolean;
  roomInfoLabel: string;
  /** @deprecated Status chip lives in the header. */
  statusLabel?: string;
  visibilityLabel: string;
  visibilityPublicLabel: string;
  visibilityPrivateLabel: string;
  /** @deprecated Room code lives in the header. */
  inviteCodeLabel?: string;
  /** @deprecated Fast badge lives in the header. */
  fastRoomLabel?: string;
  notesLabel: string;
}

export function LobbySidebarRoomInfo({
  room,
  isHost,
  roomInfoLabel,
  visibilityLabel,
  visibilityPublicLabel,
  visibilityPrivateLabel,
  notesLabel,
}: LobbySidebarRoomInfoProps) {
  return (
    <LobbyCard>
      <CardTitle>{roomInfoLabel}</CardTitle>
      <InfoRow>
        <InfoLabel>{visibilityLabel}</InfoLabel>
        <InfoValue>
          {room.visibility === 'public'
            ? `🌐 ${visibilityPublicLabel}`
            : `🔒 ${visibilityPrivateLabel}`}
        </InfoValue>
      </InfoRow>
      {room.notes ? (
        <InfoRow>
          <InfoLabel>{notesLabel}</InfoLabel>
          <InfoValue className="text-xs break-words max-w-[180px] text-right">
            {room.notes}
          </InfoValue>
        </InfoRow>
      ) : null}

      {isHost && room.status === 'lobby' && (
        <div id="lobby-invite-section">
          <InviteFriendPicker roomId={room.id} />
        </div>
      )}
    </LobbyCard>
  );
}
