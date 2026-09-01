import { CardsIcon, SkullIcon, IdleBadge, Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalPlayerTableState, CriticalLogEntry } from '../../types';
import { getPlayerColor } from '@/shared/lib/playerColors';
import { ChatBubble } from '../ChatBubble';
import { SeaBattlePopup } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattlePopup';
import { InGameAvatar } from '@/features/games/ui/InGameAvatar';

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
  logs?: CriticalLogEntry[];
}

const TURN_RING = '#34d399';
const ELIMINATED_RING = 'rgba(239, 68, 68, 0.85)';
const TARGET_RING = '#f472b6';

function findLastMessage(logs: CriticalLogEntry[], playerId: string) {
  return logs.findLast(
    (log) => log.type === 'message' && log.senderId === playerId,
  );
}

interface OpponentTileState {
  alive: boolean;
  isCurrentTurn: boolean;
  isTarget: boolean;
}

/**
 * Builds the screen-reader label for an opponent tile by appending the
 * single active state suffix (eliminated / armed target / on the clock)
 * in parentheses. Priority order matches the visual ring priority:
 * dead beats target beats current-turn. Only one suffix is translated
 * per render — three unconditional t() lookups was wasted work since
 * the suffixes are mutually exclusive.
 */
function describeOpponentTile(
  name: string,
  t: (key: string) => string,
  state: OpponentTileState,
): string {
  const suffixKey = !state.alive
    ? 'eliminated'
    : state.isTarget
      ? 'armedTarget'
      : state.isCurrentTurn
        ? 'currentTurn'
        : null;
  if (!suffixKey) return name;
  const suffix = t(`games.table.players.a11yState.${suffixKey}`);
  return `${name} (${suffix})`;
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
  isIdle = false,
  onSelect,
  resolveDisplayName,
  logs = [],
}: OpponentTileProps) {
  const { t } = useTranslation();
  const displayName = resolveDisplayName(
    player.playerId,
    `Player ${player.playerId.slice(0, 8)}`,
  );
  const alive = player.alive;

  const latestMessage = findLastMessage(logs, player.playerId);

  const playerColor = getPlayerColor(player.playerId);

  // Tile border carries STATE (turn/target/dead). The avatar bubble below
  // carries IDENTITY (the seat colour). Splitting these so the two never
  // compete: the previous version painted seat colour on the tile border
  // when alive/idle, which read as two different identifiers for the same
  // person when the player was on the clock (border was green, avatar was
  // their seat colour). The preview reserves the tile border for state.
  let ringColor: string = 'rgba(255,255,255,0.16)';
  if (!alive) ringColor = ELIMINATED_RING;
  else if (isTarget) ringColor = TARGET_RING;
  else if (isCurrentTurn) ringColor = TURN_RING;

  const ringStyle = !alive ? 'dashed' : 'solid';
  // Duel mode pushes the lone opponent to focal size; FFA tiles are
  // smaller because up to 5 share the row. Mobile knocks both down so
  // they fit thumb-width. Caller (OpponentsRow) scales by opponent count
  // — fallback to the duel/non-duel branch for components rendered in
  // isolation (tests / storybook).
  // Desktop uses the richer `md` disc (72px) so the equipped cosmetics read
  // clearly; mobile FFA stays on `sm` (40px) to fit thumb-width tiles. The
  // seat-colour bubble hugs the disc with an 8px ring gap. The tile is sized
  // to its natural content height (see `flex={0}` below) so a larger disc
  // grows the card instead of overflowing it.
  const avatarSizeName: 'sm' | 'md' = isMobile ? 'sm' : 'md';
  const discSize = avatarSizeName === 'md' ? 72 : 40;
  const bubbleSize = discSize + 8;
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

  // Outer non-interactive wrapper hosts the chat bubble + Sea Battle
  // popup, so clicking the popup's Challenge button isn't nested inside
  // the inner `role="button"` tile (which steals the click via `onPress`
  // and blocks the popup's `router.push` from firing). The tile itself
  // is the only press target.
  return (
    <div
      className="flex flex-col items-stretch relative shrink-0"
      style={{ flex: isDuel ? 0 : 1 }}
    >
      {latestMessage && (
        <>
          <ChatBubble
            key={`bubble-${latestMessage.id}`}
            message={latestMessage.message}
            position="bottom"
          />
          <SeaBattlePopup
            key={`popup-${latestMessage.id}`}
            playerId={player.playerId}
            playerName={displayName}
            visible={true}
            position="bottom"
          />
        </>
      )}
      <div
        className={`flex flex-col relative items-center gap-1 px-2 py-2 rounded-[12px] border bg-[rgba(12,17,28,0.92)] z-[100] flex-[0] shrink-0 ${interactive ? 'transition-colors duration-150 hover:border-[#f472b6]' : ''}`}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          borderStyle: ringStyle,
          borderColor: ringColor,
          width: isDuel ? (isMobile ? 180 : 240) : '100%',
          maxWidth: isDuel ? (isMobile ? 180 : 240) : 180,
          minWidth: isMobile ? 96 : 120,
          minHeight: bubbleSize + 64,
          opacity: alive ? 1 : 0.6,
        }}
        onClick={interactive ? onSelect : undefined}
        data-testid={`player-card-${player.playerId}`}
        data-alive={alive ? 'true' : 'false'}
        data-current-turn={isCurrentTurn ? 'true' : 'false'}
        data-target={isTarget ? 'true' : 'false'}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-pressed={interactive ? isTarget : undefined}
        aria-label={describeOpponentTile(
          displayName,
          t as unknown as (key: string) => string,
          { alive, isCurrentTurn, isTarget },
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Seat-colour identity ring. `overflow: hidden` clips the avatar to a
            clean circle and guarantees it can't spill out of its slot (an
            unclipped, oversized disc previously overflowed the tile). */}
        <div
          className="flex flex-col rounded-[9999px] bg-[rgba(255,255,255,0.08)] border-[2px] items-center justify-center overflow-hidden shrink-0"
          style={{
            width: bubbleSize,
            height: bubbleSize,
            borderColor: avatarBorderColor,
          }}
        >
          {alive ? (
            <InGameAvatar
              playerId={player.playerId}
              name={displayName}
              size={avatarSizeName}
              data-testid={`player-avatar-${player.playerId}`}
            />
          ) : (
            <SkullIcon size={Math.round(discSize * 0.55)} />
          )}
        </div>
        <div className="flex flex-row items-center gap-4 max-w-full">
          <Typography
            uiSize="xs"
            weight="700"
            className="tracking-[0.3px] line-clamp-1"
            style={{ maxWidth: isMobile ? 80 : 100 }}
            data-testid={`player-name-${player.playerId}`}
          >
            {displayName}
          </Typography>
          {isIdle && <IdleBadge />}
        </div>
        {alive ? (
          <div
            className="flex flex-row items-center gap-4 opacity-[0.85]"
            data-testid={`player-stats-count-${player.playerId}`}
          >
            <CardsIcon size={11} />
            <Typography uiSize="xs" weight="800" className="tracking-[0.4px]">
              {player.hand.length}
            </Typography>
          </div>
        ) : (
          <Typography
            uiSize="xs"
            weight="800"
            className="uppercase tracking-[1px]"
            style={{ color: ELIMINATED_RING }}
            data-testid={`player-eliminated-label-${player.playerId}`}
          >
            {t('games.table.players.eliminated')}
          </Typography>
        )}
      </div>
    </div>
  );
}
