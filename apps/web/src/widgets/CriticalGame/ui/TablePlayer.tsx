import React, { useMemo } from 'react';
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
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { IdleBadge } from '@/shared/ui';
import { useMedia, Text } from 'tamagui';
import type { GameVariant } from '@arcadeum/ui';
import { useScenePalette } from './ScenePaletteContext';
import { useTranslation } from '@/shared/lib/useTranslation';

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

const ELIMINATED_RING_COLOR = 'rgba(239, 68, 68, 0.85)';

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
  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);
  const isPlayerIdle = idlePlayers.includes(playerId);
  const media = useMedia();
  const isMobile = media.sm;
  const palette = useScenePalette();
  const { t } = useTranslation();

  // Task 11 sizing: 58/68 outer wrapper, 48/56 inner avatar (mobile/desktop).
  const avatarWrapperSize = isMobile ? 58 : 68;
  const avatarInnerSize = isMobile ? 48 : 56;

  const showTurnRing = isCurrent && player.alive;
  const showEliminatedRing = !player.alive;

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Circular Positioning Logic (from table.ts)
  const positionStyle = useMemo(() => {
    if (isMobile) {
      return {
        position: 'relative' as const,
        left: 'auto',
        top: 'auto',
        transform: 'none',
        width: 'auto',
      };
    }

    const angle = (relativeIndex / totalPlayers) * 2 * Math.PI + Math.PI / 2;
    const radiusX = 42; // Increased from 38
    const radiusY = 38; // Increased from 36
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    } as const;
  }, [isMobile, relativeIndex, totalPlayers]);

  // Determine bubble position
  let bubblePosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  if (totalPlayers > 0) {
    if (relativeIndex === 0) {
      bubblePosition = 'top';
    } else {
      const ratio = relativeIndex / totalPlayers;
      if (ratio > 0.1 && ratio < 0.4) {
        bubblePosition = 'right';
      } else if (ratio >= 0.4 && ratio <= 0.6) {
        bubblePosition = 'bottom';
      } else if (ratio > 0.6 && ratio < 0.9) {
        bubblePosition = 'left';
      } else {
        bubblePosition = 'top';
      }
    }
  }

  return (
    <PlayerPositionWrapper key={playerId} style={positionStyle}>
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
        $variant={cardVariant as GameVariant}
        data-testid={`player-card-${playerId}`}
        className={`player-card-entrance${isCurrent ? ' player-card-float' : ''}`}
      >
        {isCurrent && (
          <TurnIndicator $variant={cardVariant as GameVariant}>
            ⭐
          </TurnIndicator>
        )}

        {/* Avatar with turn / elimination decorations */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: avatarWrapperSize,
            height: avatarWrapperSize,
          }}
        >
          {showTurnRing && (
            <div
              data-testid="player-turn-ring"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${palette.opponentTurnRingColor}`,
                boxShadow: `0 0 24px ${palette.opponentTurnHaloColor}`,
                pointerEvents: 'none',
              }}
            />
          )}
          {showEliminatedRing && (
            <div
              data-testid="player-eliminated-ring"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px dashed ${ELIMINATED_RING_COLOR}`,
                pointerEvents: 'none',
              }}
            />
          )}
          <PlayerAvatar
            $isCurrentTurn={isCurrent}
            $isAlive={player.alive}
            $variant={cardVariant as GameVariant}
            width={avatarInnerSize}
            height={avatarInnerSize}
            borderRadius={9999}
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Text
              fontSize={15}
              fontWeight="800"
              letterSpacing={0.5}
              color={
                player.alive
                  ? isCurrent
                    ? '#1a1a1a'
                    : '$colorSubtle'
                  : 'rgba(255,255,255,0.3)'
              }
            >
              {player.alive ? initials : '💀'}
            </Text>
          </PlayerAvatar>
        </div>

        <PlayerName data-testid={`player-name-${playerId}`}>
          {displayName}
          {isPlayerIdle && <IdleBadge />}
        </PlayerName>
        {!player.alive && (
          <Text
            data-testid={`player-eliminated-label-${playerId}`}
            fontSize={11}
            fontWeight="700"
            letterSpacing={1}
            textTransform="uppercase"
            color={ELIMINATED_RING_COLOR}
          >
            {t('games.table.players.eliminated')}
          </Text>
        )}
        {player.alive && (
          <PlayerStatsContainer>
            <PlayerCardCount $isCurrentTurn={isCurrent}>
              <Text>🃏 {player.hand.length}</Text>
            </PlayerCardCount>
            {stash.length > 0 && (
              <PlayerCardCount $isCurrentTurn={isCurrent} $type="stash">
                <Text>🏰 {stash.length}</Text>
              </PlayerCardCount>
            )}
            {markedCards.length > 0 && (
              <PlayerCardCount $isCurrentTurn={isCurrent} $type="marked">
                <Text>🏷️ {markedCards.length}</Text>
              </PlayerCardCount>
            )}
          </PlayerStatsContainer>
        )}
      </PlayerCard>
    </PlayerPositionWrapper>
  );
}
