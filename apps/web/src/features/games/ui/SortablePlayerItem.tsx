import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GameRoomMemberSummary } from '@/shared/types/games';
import { Button, Badge } from '@arcadeum/ui';
import { PlayerItem, PlayerInfo, LobbyPlayerName } from './lobbyStyles';
import { InGameAvatar } from './InGameAvatar';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isHost ? { ...attributes, ...listeners } : {})}
    >
      <PlayerItem isHost={isRoomHost}>
        <InGameAvatar
          playerId={member.id}
          name={member.displayName}
          size="sm"
        />
        <PlayerInfo>
          <div className="flex flex-row flex-wrap items-center gap-1.5 min-w-0">
            <LobbyPlayerName className="break-words" title={member.displayName}>
              {member.displayName}
            </LobbyPlayerName>
            {isRoomHost && (
              <Badge variant="info" className="shrink-0">
                HOST
              </Badge>
            )}
          </div>
        </PlayerInfo>
        {isHost && totalCount > 1 && (
          <div className="flex flex-row items-center gap-1 shrink-0 ml-auto">
            <Button
              className="py-1 px-2 min-w-[auto]"
              variant="ghost"
              size="sm"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              className="py-1 px-2 min-w-[auto]"
              variant="ghost"
              size="sm"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={index === totalCount - 1}
            >
              ↓
            </Button>
          </div>
        )}
        {onKick && !isRoomHost && (
          <Button
            className="py-1 px-2 min-w-[auto] shrink-0 ml-auto"
            variant="danger"
            ghost
            size="sm"
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              onKick();
            }}
          >
            ✕
          </Button>
        )}
      </PlayerItem>
    </div>
  );
}
