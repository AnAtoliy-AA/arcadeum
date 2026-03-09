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
import { SeaBattlePopup } from '@/widgets/SeaBattleGame/ui/SeaBattlePopup';
import type { CriticalLogEntry, CriticalPlayerTableState } from '../types';
import { useGameStore } from '@/features/games/store/gameStore';
import { IdleBadge } from '@/shared/ui';

export interface TablePlayerProps {
  player: CriticalPlayerTableState;
  index: number;
  relativeIndex: number;
  totalPlayers: number;
  currentTurnIndex: number;
  currentUserId: string | null;
  logs?: CriticalLogEntry[];
  cardVariant?: string;
  resolveDisplayName: (playerId: string, fallback: string) => string;
}

function findLastMessage(logs: CriticalLogEntry[], playerId: string) {
  return logs.findLast(
    (log) => log.type === 'message' && log.senderId === playerId,
  );
}

export function TablePlayer({
  player,
  index,
  relativeIndex,
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
  const idlePlayers = useGameStore((s) => s.idlePlayers);
  const isPlayerIdle = idlePlayers.includes(playerId);

  // Determine bubble position based on player relative position index
  // relativeIndex 0 is always bottom center
  let bubblePosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  if (totalPlayers > 0) {
    if (relativeIndex === 0) {
      // Bottom center player (the viewer) - bubbles go up
      bubblePosition = 'top';
    } else {
      const ratio = relativeIndex / totalPlayers;
      if (ratio > 0.1 && ratio < 0.4) {
        // Left side of table - bubbles go right
        bubblePosition = 'right';
      } else if (ratio >= 0.4 && ratio <= 0.6) {
        // Top of table - bubbles go down
        bubblePosition = 'bottom';
      } else if (ratio > 0.6 && ratio < 0.9) {
        // Right side of table - bubbles go left
        bubblePosition = 'left';
      } else {
        // Fallback for edge cases near bottom
        bubblePosition = 'top';
      }
    }
  }

  return (
    <PlayerPositionWrapper
      key={playerId}
      $position={relativeIndex}
      $total={totalPlayers}
      $isCurrentUser={isCurrentUserCard}
    >
      {latestMessage && (
        <>
          <ChatBubble
            key={`bubble-${latestMessage.id}`}
            message={latestMessage.message}
            position={bubblePosition}
          />
          {!isCurrentUserCard && (
            <SeaBattlePopup
              key={`popup-${latestMessage.id}`}
              playerId={playerId}
              playerName={displayName}
              visible={true}
              position={bubblePosition}
            />
          )}
        </>
      )}
      <PlayerCard
        $isCurrentTurn={isCurrent}
        $isAlive={player.alive}
        $isCurrentUser={isCurrentUserCard}
        $variant={cardVariant}
        data-testid={`player-card-${playerId}`}
      >
        {isCurrent && <TurnIndicator $variant={cardVariant}>⭐</TurnIndicator>}
        <PlayerAvatar
          $isCurrentTurn={isCurrent}
          $isAlive={player.alive}
          $variant={cardVariant}
        >
          {player.alive ? '🎮' : '💀'}
        </PlayerAvatar>
        <PlayerName
          $isCurrentTurn={isCurrent}
          $variant={cardVariant}
          data-testid={`player-name-${playerId}`}
        >
          {displayName}
          {isPlayerIdle && <IdleBadge />}
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
