import {
  PlayerPositionWrapper,
  PlayerCard,
  PlayerAvatar,
  PlayerName,
  PlayerCardCount,
  TurnIndicator,
} from './styles';
import { ChatBubble } from './ChatBubble';
import type { ExplodingCatsCard, ExplodingCatsLogEntry } from '../types';

export interface TablePlayerProps {
  player: {
    playerId: string;
    alive: boolean;
    hand: ExplodingCatsCard[];
  };
  index: number;
  totalPlayers: number;
  currentTurnIndex: number;
  currentUserId: string | null;
  logs?: ExplodingCatsLogEntry[];
  resolveDisplayName: (playerId: string, fallback: string) => string;
}

export function TablePlayer({
  player,
  index,
  totalPlayers,
  currentTurnIndex,
  currentUserId,
  logs = [],
  resolveDisplayName,
}: TablePlayerProps) {
  const { playerId } = player;
  const isCurrent = index === currentTurnIndex;
  const isCurrentUserCard = playerId === currentUserId;
  const displayName = resolveDisplayName(
    playerId,
    `Player ${playerId.slice(0, 8)}`,
  );

  const now = new Date().getTime();

  // Find latest message for this player
  const latestMessage = logs
    .filter(
      (log) =>
        log.type === 'message' &&
        log.senderId === playerId &&
        // Only show messages from the last 15 seconds
        new Date(log.createdAt).getTime() > now - 15000,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  // Determine bubble position based on player position index
  let bubblePosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  if (totalPlayers > 0) {
    const ratio = index / totalPlayers;
    if (ratio >= 0.875 || ratio < 0.125) {
      bubblePosition = 'top';
    } else if (ratio >= 0.125 && ratio < 0.375) {
      bubblePosition = 'right';
    } else if (ratio >= 0.375 && ratio < 0.625) {
      bubblePosition = 'bottom';
    } else {
      bubblePosition = 'left';
    }
  }

  return (
    <PlayerPositionWrapper
      key={playerId}
      $position={index}
      $total={totalPlayers}
    >
      {latestMessage && (
        <ChatBubble
          key={latestMessage.id}
          message={latestMessage.message}
          position={bubblePosition}
        />
      )}
      <PlayerCard
        $isCurrentTurn={isCurrent}
        $isAlive={player.alive}
        $isCurrentUser={isCurrentUserCard}
      >
        {isCurrent && <TurnIndicator>⭐</TurnIndicator>}
        <PlayerAvatar $isCurrentTurn={isCurrent} $isAlive={player.alive}>
          {player.alive ? '🎮' : '💀'}
        </PlayerAvatar>
        <PlayerName $isCurrentTurn={isCurrent}>{displayName}</PlayerName>
        {player.alive && (
          <PlayerCardCount $isCurrentTurn={isCurrent}>
            🃏 {player.hand.length}
          </PlayerCardCount>
        )}
      </PlayerCard>
    </PlayerPositionWrapper>
  );
}
