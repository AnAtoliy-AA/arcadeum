'use client';

import { YStack, XStack, Text, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { IdleBadge } from '@/shared/ui';
import type { CriticalPlayerTableState } from '../../types';

interface OpponentTileProps {
  player: CriticalPlayerTableState;
  isCurrentTurn: boolean;
  isTarget?: boolean;
  /**
   * Click handler invoked when the tile is activated (mouse, touch, Enter,
   * or Space). Omitted when the tile isn't a valid attack target — e.g.
   * eliminated players or when the local player is not on the clock.
   */
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

/**
 * Single opponent in the widget-mode opponents row. Compact card with
 * avatar + name + hand count. Surfaces three ring states:
 *   - turn ring (green): this player is currently on the clock
 *   - eliminated ring (red dashed): out of the game
 *   - target ring (pink): armed-for-attack indicator
 *
 * Defuse counts are deliberately NOT shown — `CriticalPlayerState` from
 * the server doesn't expose them, and revealing them would give away
 * attack calculus for free (see PR #631 review §2).
 */
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

  let ringColor: string = 'rgba(255,255,255,0.10)';
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
      data-testid={`opponent-tile-${player.playerId}`}
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
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={14} fontWeight="800" letterSpacing={0.5}>
          {alive ? initialsOf(displayName) : '💀'}
        </Text>
      </YStack>
      <XStack alignItems="center" gap={4} maxWidth="100%">
        <Text
          data-testid={`opponent-tile-name-${player.playerId}`}
          fontSize={12}
          fontWeight="700"
          letterSpacing={0.3}
          numberOfLines={1}
          maxWidth={isMobile ? 80 : 100}
        >
          {displayName}
        </Text>
        {isIdle && <IdleBadge />}
      </XStack>
      {alive ? (
        <Text
          data-testid={`opponent-tile-count-${player.playerId}`}
          fontSize={11}
          fontWeight="800"
          letterSpacing={0.4}
          opacity={0.85}
        >
          🃏 {player.hand.length}
        </Text>
      ) : (
        <Text
          data-testid={`opponent-tile-eliminated-${player.playerId}`}
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
