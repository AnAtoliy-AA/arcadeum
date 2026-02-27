import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { GameRoomSummary } from '@/shared/types/games';
import { Button, IdleBadge } from '@/shared/ui';
import { useGameStore } from '@/features/games/store/gameStore';
import {
  PlayerItem,
  LobbyPlayerAvatar,
  PlayerInfo,
  LobbyPlayerName,
  PlayerBadge,
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

interface SortablePlayerItemProps {
  member: NonNullable<GameRoomSummary['members']>[0];
  isHost: boolean;
  isRoomHost: boolean;
  roomHostId: string;
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
  const idlePlayers = useGameStore((s) => s.idlePlayers);
  const isPlayerIdle = idlePlayers.includes(member.id);

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
          <LobbyPlayerName>
            {member.displayName}
            {isPlayerIdle && <IdleBadge />}
          </LobbyPlayerName>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
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
            style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
          >
            ↓
          </Button>
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
