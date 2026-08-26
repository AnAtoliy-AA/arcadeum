import React from 'react';
import type { ReactNode } from 'react';
import type { GameSessionSummary } from '@/shared/types/games';
import { Card, Badge, Avatar, Typography } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

interface PlayerListProps {
  session: GameSessionSummary | null;
  currentUserId?: string | null;
  className?: string;
  showStatus?: boolean;
  showScore?: boolean;
  onPlayerAction?: (playerId: string, action: string) => void;
}

type PlayerStatus = 'active' | 'inactive' | 'away' | 'offline';

const STATUS_COLOR_CLASSES: Record<PlayerStatus, string> = {
  active: 'bg-[#10b981]',
  inactive: 'bg-[#6b7280]',
  away: 'bg-[#f59e0b]',
  offline: 'bg-[#6b7280]',
};

const List = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-stretch gap-2 max-h-[300px] overflow-y-auto',
      className,
    )}
  >
    {children}
  </div>
);

const PlayerItem = ({
  isCurrent = false,
  isHost = false,
  className,
  children,
  onClick,
}: {
  isCurrent?: boolean;
  isHost?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) => (
  <Card
    className={cx(
      'flex flex-row items-center cursor-pointer transition-all duration-300 ease-out hover:translate-x-[2px] hover:shadow-[0_0_8px_rgba(0,0,0,0.1)]',
      isCurrent
        ? 'bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(29,78,216,0.12))] border-[var(--primary)]'
        : 'bg-[var(--background)] border-[var(--borderColor)]',
      isHost && 'border-[#10b981]',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </Card>
);

const StatusIndicator = ({ status = 'active' }: { status?: PlayerStatus }) => (
  <div className={cx('w-2 h-2 rounded-[4px]', STATUS_COLOR_CLASSES[status])} />
);

export function PlayerList({
  session,
  currentUserId,
  className,
  showStatus = true,
  showScore = false,
  onPlayerAction,
}: PlayerListProps) {
  if (!session) {
    return (
      <List className={className}>
        <PlayerItem>
          <Avatar name="?" size="sm" />
          <div className="flex flex-col items-stretch flex-1 -ml-3">
            <Typography className={'font-semibold text-[14px]'}>
              No players
            </Typography>
          </div>
        </PlayerItem>
      </List>
    );
  }

  // Sample data kept for logic consistency
  const players = [
    {
      id: 'player1',
      name: 'Player 1',
      isHost: true,
      status: 'active' as const,
      score: 0,
      isCurrent: currentUserId === 'player1',
    },
    {
      id: 'player2',
      name: 'Player 2',
      isHost: false,
      status: 'active' as const,
      score: 0,
      isCurrent: currentUserId === 'player2',
    },
  ];

  return (
    <List className={className}>
      {players.map((player) => (
        <PlayerItem
          key={player.id}
          isCurrent={player.isCurrent}
          isHost={player.isHost}
          onClick={() => onPlayerAction?.(player.id, 'info')}
        >
          <Avatar
            name={player.name}
            size="sm"
            {...(player.isHost
              ? {
                  backgroundColor: '#10b981',
                }
              : {})}
          />

          <div className="flex flex-col items-stretch flex-1 -ml-3">
            <div className="flex flex-row items-center gap-2 -mb-1">
              <Typography className={'font-semibold text-[14px] line-clamp-1'}>
                {player.name}
              </Typography>
              {player.isHost && (
                <Badge variant="success" size="sm">
                  Host
                </Badge>
              )}
            </div>

            <div className="flex flex-row items-center gap-2">
              {showStatus && <StatusIndicator status={player.status} />}
              {showScore && (
                <Typography
                  className={'text-[12px] text-[var(--textSecondary)]'}
                >
                  {player.score} pts
                </Typography>
              )}
            </div>
          </div>
        </PlayerItem>
      ))}
    </List>
  );
}
