'use client';

import { YStack, XStack, Text, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { IdleBadge } from '@/shared/ui';
import type { CriticalPlayerTableState } from '../../types';
import { getPlayerColor } from '@/shared/lib/playerColors';

interface OpponentTileProps {
  player: CriticalPlayerTableState;
  isCurrentTurn: boolean;
  isTarget?: boolean;
  onSelect?: () => void;
  resolveDisplayName: (playerId: string, fallback: string) => string;
}

const TURN_RING = '#34d399';
const ELIMINATED_RING = 'rgba(239, 68, 68, 0.85)';
const TARGET_RING = '#f472b6';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function OpponentTile({
  player,
  isCurrentTurn,
  isTarget = false,
  onSelect,
  resolveDisplayName,
}: OpponentTileProps) {
  const { t } = useTranslation();
  const media = useMedia();
  const isMobile = media.sm;
  const displayName = resolveDisplayName(
    player.playerId,
    `Player ${player.playerId.slice(0, 8)}`,
  );
  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);
  const isIdle = idlePlayers.includes(player.playerId);
  const alive = player.alive;

  const playerColor = getPlayerColor(player.playerId);

  let ringColor: string = alive ? playerColor : 'rgba(255,255,255,0.10)';
  if (!alive) ringColor = ELIMINATED_RING;
  else if (isTarget) ringColor = TARGET_RING;
  else if (isCurrentTurn) ringColor = TURN_RING;

  const ringStyle = !alive ? 'dashed' : 'solid';
  const avatarSize = isMobile ? 36 : 48;
  const interactive = alive && !!onSelect;
  const handleKeyDown = interactive
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }
    : undefined;

  return (
    <YStack
      data-testid={`player-card-${player.playerId}`}
      data-alive={alive ? 'true' : 'false'}
      data-current-turn={isCurrentTurn ? 'true' : 'false'}
      data-target={isTarget ? 'true' : 'false'}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? isTarget : undefined}
      aria-label={
        interactive ? `${displayName}${isTarget ? ' (target)' : ''}` : undefined
      }
      onPress={interactive ? onSelect : undefined}
      onKeyDown={handleKeyDown}
      cursor={interactive ? 'pointer' : 'default'}
      hoverStyle={interactive ? { borderColor: TARGET_RING } : undefined}
      alignItems="center"
      gap="$1"
      paddingHorizontal="$2"
      paddingVertical="$2"
      borderRadius={12}
      borderWidth={1}
      borderStyle={ringStyle}
      borderColor={ringColor}
      backgroundColor="rgba(0,0,0,0.35)"
      width={isMobile ? 96 : 120}
      minWidth={isMobile ? 96 : 120}
      flexShrink={0}
      opacity={alive ? 1 : 0.6}
    >
      <YStack
        width={avatarSize}
        height={avatarSize}
        borderRadius={9999}
        backgroundColor="rgba(255,255,255,0.08)"
        borderWidth={alive ? 2 : 0}
        borderColor={alive ? playerColor : 'transparent'}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={14} fontWeight="800" letterSpacing={0.5}>
          {alive ? initialsOf(displayName) : '💀'}
        </Text>
      </YStack>
      <XStack alignItems="center" gap={4} maxWidth="100%">
        <Text
          data-testid={`player-name-${player.playerId}`}
          fontSize={12}
          fontWeight="700"
          letterSpacing={0.3}
          numberOfLines={1}
          maxWidth={isMobile ? 80 : 100}
          style={alive ? { color: playerColor } : undefined}
        >
          {displayName}
        </Text>
        {isIdle && <IdleBadge />}
      </XStack>
      {alive ? (
        <Text
          data-testid={`player-stats-count-${player.playerId}`}
          fontSize={11}
          fontWeight="800"
          letterSpacing={0.4}
          opacity={0.85}
        >
          🃏 {player.hand.length}
        </Text>
      ) : (
        <Text
          data-testid={`player-eliminated-label-${player.playerId}`}
          fontSize={10}
          fontWeight="800"
          letterSpacing={1}
          textTransform="uppercase"
          color={ELIMINATED_RING}
        >
          {t('games.table.players.eliminated')}
        </Text>
      )}
    </YStack>
  );
}
