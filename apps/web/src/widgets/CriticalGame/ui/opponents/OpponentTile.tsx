'use client';

import { YStack, XStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { IdleBadge } from '@/shared/ui';
import type { CriticalPlayerTableState } from '../../types';
import { getPlayerColor } from '@/shared/lib/playerColors';

interface OpponentTileProps {
  player: CriticalPlayerTableState;
  isCurrentTurn: boolean;
  isTarget?: boolean;
  /**
   * True when the row is in duel mode (one opponent). Used to scale the
   * tile up so the focal opponent reads at viewport size rather than
   * floating lost in the row.
   */
  isDuel?: boolean;
  /**
   * Mobile flag passed down from OpponentsRow so the row decides the
   * breakpoint once and tiles inherit consistent sizing — useMedia in
   * each tile fragmented the boundary across components.
   */
  isMobile?: boolean;
  /**
   * Computed avatar diameter from `OpponentsRow.getAvatarSize`. Scales
   * with FFA opponent count so 5-up rows don't look avatar-dominated and
   * 3-up rows don't look sparse. Optional — falls back to the legacy
   * duel/non-duel branch if the parent forgot to thread it.
   */
  avatarSize?: number;
  /**
   * True when the player's id is in `gameStore.idlePlayers`. Lifted to
   * `OpponentsRow` so the store subscription runs once instead of
   * fan-out per tile (5 tiles × `.includes` scans on every state update).
   */
  isIdle?: boolean;
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

interface AriaLabelInput {
  alive: boolean;
  isCurrentTurn: boolean;
  isTarget: boolean;
  eliminatedSuffix: string;
  currentTurnSuffix: string;
  targetSuffix: string;
}

/**
 * Builds the screen-reader label for an opponent tile by appending the
 * active state suffixes (eliminated / on the clock / armed target) in
 * parentheses. We keep all three states visible to AT users — the visual
 * ring colour conveys the same thing for sighted users.
 */
function composeAriaLabel(name: string, input: AriaLabelInput): string {
  const parts: string[] = [name];
  if (!input.alive) parts.push(`(${input.eliminatedSuffix})`);
  if (input.alive && input.isCurrentTurn) parts.push(`(${input.currentTurnSuffix})`);
  if (input.alive && input.isTarget) parts.push(`(${input.targetSuffix})`);
  return parts.join(' ');
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
  isDuel = false,
  isMobile = false,
  avatarSize,
  isIdle = false,
  onSelect,
  resolveDisplayName,
}: OpponentTileProps) {
  const { t } = useTranslation();
  const displayName = resolveDisplayName(
    player.playerId,
    `Player ${player.playerId.slice(0, 8)}`,
  );
  const alive = player.alive;

  const playerColor = getPlayerColor(player.playerId);

  let ringColor: string = alive ? playerColor : 'rgba(255,255,255,0.10)';
  if (!alive) ringColor = ELIMINATED_RING;
  else if (isTarget) ringColor = TARGET_RING;
  else if (isCurrentTurn) ringColor = TURN_RING;

  const ringStyle = !alive ? 'dashed' : 'solid';
  // Duel mode pushes the lone opponent to focal size; FFA tiles are
  // smaller because up to 5 share the row. Mobile knocks both down so
  // they fit thumb-width. Caller (OpponentsRow) scales by opponent count
  // — fallback to the duel/non-duel branch for components rendered in
  // isolation (tests / storybook).
  const finalAvatarSize =
    avatarSize ?? (isMobile ? (isDuel ? 64 : 36) : isDuel ? 88 : 48);
  // Keep `playerColor` on the avatar border at low opacity when dead so
  // the eliminated seat still reads as that player rather than a generic
  // grey pill. `66` ≈ 40% alpha against the hex base.
  const avatarBorderColor = alive ? playerColor : `${playerColor}66`;
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
      // Compose the accessible name from the visible visual states so a
      // screen-reader user hears the same context a sighted player sees
      // (turn ring, target ring, dead/dashed). Falls back to the bare
      // name for non-interactive tiles (alive but not currently armable).
      aria-label={composeAriaLabel(displayName, {
        alive,
        isCurrentTurn,
        isTarget,
        eliminatedSuffix: t('games.table.players.a11yState.eliminated'),
        currentTurnSuffix: t('games.table.players.a11yState.currentTurn'),
        targetSuffix: t('games.table.players.a11yState.armedTarget'),
      })}
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
      // FFA: flex-grow with a max so 2–5 tiles distribute evenly across
      // the row. Duel: lock the lone tile to a focal width so the
      // opponent reads as the primary subject, not space-betweened.
      flex={isDuel ? 0 : 1}
      width={isDuel ? (isMobile ? 180 : 240) : undefined}
      maxWidth={isDuel ? (isMobile ? 180 : 240) : 180}
      minWidth={isMobile ? 96 : 120}
      flexShrink={0}
      opacity={alive ? 1 : 0.6}
      // Scroll-snap on mobile: align each tile to the start of the
      // scroll container so swipes don't strand a tile mid-row.
      style={isMobile ? { scrollSnapAlign: 'start' } : undefined}
    >
      <YStack
        width={finalAvatarSize}
        height={finalAvatarSize}
        borderRadius={9999}
        backgroundColor="rgba(255,255,255,0.08)"
        borderWidth={2}
        borderColor={avatarBorderColor}
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
