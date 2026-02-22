import {
  PlayerPositionWrapper,
  PlayerCard,
  PlayerAvatar,
  PlayerName,
  PlayerCardCount,
  TurnIndicator,
  PlayerStatsContainer,
} from './styles';
import { ChatBubble } from './ChatBubble';
import type { CriticalCard, CriticalLogEntry, MarkedCardInfo } from '../types';

export interface TablePlayerProps {
  player: {
    playerId: string;
    alive: boolean;
    hand: CriticalCard[];
    stash?: CriticalCard[];
    markedCards?: MarkedCardInfo[];
  };
  index: number;
  totalPlayers: number;
  currentTurnIndex: number;
  currentUserId: string | null;
  logs?: CriticalLogEntry[];
  resolveDisplayName: (playerId: string, fallback: string) => string;
  cardVariant?: string;
}

function findLastMessage(logs: CriticalLogEntry[], playerId: string) {
  return logs.findLast(
    (log) => log.type === 'message' && log.senderId === playerId,
  );
}

export function TablePlayer({
  player,
  index,
  totalPlayers,
  currentTurnIndex,
  currentUserId,
  logs = [],
  resolveDisplayName,
  cardVariant,
}: TablePlayerProps) {
  const { playerId, stash = [], markedCards = [] } = player;
  const isCurrent = index === currentTurnIndex;
  const isCurrentUserCard = playerId === currentUserId;
  const displayName = resolveDisplayName(
    playerId,
    `Player ${playerId.slice(0, 8)}`,
  );

  const latestMessage = findLastMessage(logs, playerId);

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
        $variant={cardVariant}
      >
        {isCurrent && <TurnIndicator $variant={cardVariant}>⭐</TurnIndicator>}
        <PlayerAvatar
          $isCurrentTurn={isCurrent}
          $isAlive={player.alive}
          $variant={cardVariant}
        >
          {player.alive ? '🎮' : '💀'}
        </PlayerAvatar>
        <PlayerName $isCurrentTurn={isCurrent} $variant={cardVariant}>
          {displayName}
        </PlayerName>
        {player.alive && (
          <PlayerStatsContainer>
            <PlayerCardCount $isCurrentTurn={isCurrent} $variant={cardVariant}>
              🃏 {player.hand.length}
            </PlayerCardCount>
            {stash.length > 0 && (
              <PlayerCardCount
                $isCurrentTurn={isCurrent}
                $variant={cardVariant}
                $type="stash"
              >
                🏰 {stash.length}
              </PlayerCardCount>
            )}
            {markedCards.length > 0 && (
              <PlayerCardCount
                $isCurrentTurn={isCurrent}
                $variant={cardVariant}
                $type="marked"
              >
                🏷️ {markedCards.length}
              </PlayerCardCount>
            )}
          </PlayerStatsContainer>
        )}
      </PlayerCard>
    </PlayerPositionWrapper>
  );
}
