import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GameRoomMemberSummary } from '@/shared/types/games';
import { Button } from '@/shared/ui';
import {
  PlayerItem,
  LobbyPlayerAvatar,
  PlayerInfo,
  LobbyPlayerName,
  PlayerBadge,
} from './lobbyStyles';

// ============ Avatar Colors ============

export const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

export interface SortablePlayerItemProps {
  member: GameRoomMemberSummary;
  isHost: boolean;
  isRoomHost: boolean;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SortablePlayerItem({
  member,
  isHost,
  isRoomHost,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
}: SortablePlayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isHost ? 'grab' : 'default',
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
  const avatarColor =
    AVATAR_COLORS[member.displayName.length % AVATAR_COLORS.length];

  return (
    <PlayerItem
      ref={setNodeRef}
      style={style}
      {...(isHost ? { ...attributes, ...listeners } : {})}
      $isHost={isRoomHost}
    >
      <LobbyPlayerAvatar $color={avatarColor}>
        {getInitials(member.displayName)}
      </LobbyPlayerAvatar>
      <PlayerInfo>
        <LobbyPlayerName>{member.displayName}</LobbyPlayerName>
        {isRoomHost && <PlayerBadge>HOST</PlayerBadge>}
      </PlayerInfo>
      {isHost && totalCount > 1 && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalCount - 1}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          >
            ↓
          </Button>
        </div>
      )}
    </PlayerItem>
  );
}
