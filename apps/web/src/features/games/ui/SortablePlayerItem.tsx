import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GameRoomMemberSummary } from '@/shared/types/games';
import { Button, Badge } from '@arcadeum/ui';
import { XStack } from 'tamagui';
import {
  PlayerItem,
  LobbyPlayerAvatar,
  PlayerInfo,
  LobbyPlayerName,
  LobbyPlayerAvatarText,
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
  onKick?: () => void;
}

export function SortablePlayerItem({
  member,
  isHost,
  isRoomHost,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onKick,
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

  const avatarColor =
    AVATAR_COLORS[member.displayName.length % AVATAR_COLORS.length];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isHost ? { ...attributes, ...listeners } : {})}
    >
      <PlayerItem $isHost={isRoomHost}>
        <LobbyPlayerAvatar backgroundColor={avatarColor}>
          <LobbyPlayerAvatarText>
            {member.displayName.slice(0, 2).toUpperCase()}
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
        {isHost && totalCount > 1 && (
          <XStack gap="$1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
              paddingVertical="$1"
              paddingHorizontal="$2"
              minWidth="auto"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={index === totalCount - 1}
              paddingVertical="$1"
              paddingHorizontal="$2"
              minWidth="auto"
            >
              ↓
            </Button>
          </XStack>
        )}
        {onKick && !isRoomHost && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              onKick();
            }}
            paddingVertical="$1"
            paddingHorizontal="$2"
            minWidth="auto"
            style={{ color: '#ef4444' }}
          >
            ✕
          </Button>
        )}
      </PlayerItem>
    </div>
  );
}
