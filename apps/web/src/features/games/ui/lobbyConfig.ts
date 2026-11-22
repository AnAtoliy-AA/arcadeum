import type {
  GameLobbyTheme,
  LobbyBotDifficulty,
  LobbyLabels,
  LobbyStartOptions,
  ReusableGameLobbyProps,
} from './ReusableGameLobby.types';

/** Seat limits. `max` falls back to the room's maxPlayers, then 6. */
export interface LobbySeatsConfig {
  min?: number;
  max?: number;
}

/** Bot behaviour for the lobby. */
export interface LobbyBotsConfig {
  /** Allow the host to add/remove bots and start solo with bots. */
  enabled?: boolean;
  /** Show the AI difficulty selector when bots are enabled. Default true. */
  showDifficulty?: boolean;
}

/** Which optional lobby chrome to show. */
export interface LobbyDisplayConfig {
  showFullscreenButton?: boolean;
  showReorderControls?: boolean;
  showInvitedPlayers?: boolean;
}

/**
 * Static, per-game description of a lobby. Wrappers build one of these and
 * pass it to `ReusableGameLobby` as `config`; explicit flat props on the
 * component still win over config values.
 */
export interface GameLobbyConfig {
  gameName: string;
  gameIcon: string;
  roomIcon?: string;
  variantName?: string;
  theme?: GameLobbyTheme;
  labels?: LobbyLabels;
  seats?: LobbySeatsConfig;
  bots?: LobbyBotsConfig;
  display?: LobbyDisplayConfig;
}

export interface ResolvedLobbyConfig {
  gameName: string;
  gameIcon: string;
  roomIcon: string;
  variantName?: string;
  theme: GameLobbyTheme;
  labels: LobbyLabels;
  minPlayers: number;
  maxPlayers?: number;
  enableBots: boolean;
  showDifficulty: boolean;
  showFullscreenButton: boolean;
  showReorderControls: boolean;
  showInvitedPlayers: boolean;
}

/** Merge `props.config` with flat props (flat props take precedence). */
export function resolveLobbyConfig(
  props: Pick<
    ReusableGameLobbyProps,
    | 'config'
    | 'gameName'
    | 'gameIcon'
    | 'roomIcon'
    | 'variantName'
    | 'theme'
    | 'labels'
    | 'minPlayers'
    | 'maxPlayers'
    | 'enableBots'
    | 'showDifficulty'
    | 'showFullscreenButton'
    | 'showReorderControls'
    | 'showInvitedPlayers'
  >,
): ResolvedLobbyConfig {
  const c = props.config;
  return {
    gameName: props.gameName ?? c?.gameName ?? '',
    gameIcon: props.gameIcon ?? c?.gameIcon ?? '',
    roomIcon: props.roomIcon ?? c?.roomIcon ?? '🎲',
    variantName: props.variantName ?? c?.variantName,
    theme: props.theme ?? c?.theme ?? {},
    labels: props.labels ?? c?.labels ?? {},
    minPlayers: props.minPlayers ?? c?.seats?.min ?? 2,
    maxPlayers: props.maxPlayers ?? c?.seats?.max,
    enableBots: props.enableBots ?? c?.bots?.enabled ?? false,
    showDifficulty: props.showDifficulty ?? c?.bots?.showDifficulty ?? true,
    showFullscreenButton:
      props.showFullscreenButton ?? c?.display?.showFullscreenButton ?? true,
    showReorderControls:
      props.showReorderControls ?? c?.display?.showReorderControls ?? true,
    showInvitedPlayers:
      props.showInvitedPlayers ?? c?.display?.showInvitedPlayers ?? true,
  };
}

/** Initial bot count: one bot, bounded by the seat limits. */
export function initialBotCount(minPlayers: number, maxPlayers: number) {
  return Math.max(1, Math.min(minPlayers - 1, maxPlayers - 1));
}

/** Solo host (1 player) with bots enabled starts with bots; otherwise plain. */
export function shouldStartWithBots(enableBots: boolean, playerCount: number) {
  return enableBots && playerCount === 1;
}

/** Subtitle shown under the hero when the wrapper gives no `subtitleText`. */
export function getDefaultSubtitle(args: {
  status: string;
  enableBots: boolean;
  playerCount: number;
  minPlayers: number;
  isHost: boolean;
}): string {
  if (args.status !== 'lobby') return 'Loading...';
  if (args.enableBots && args.playerCount === 1)
    return 'Single player mode available';
  if (args.playerCount < args.minPlayers)
    return `Need at least ${args.minPlayers} players`;
  if (args.isHost) return "Click 'Start Game' when ready";
  return 'Waiting for host to start...';
}

/** Badge text describing the board/grid size, or null when not applicable. */
export function getFieldSizeBadge(
  gameId: string,
  opts: Record<string, unknown> | undefined,
): string | null {
  if (!opts) return null;
  if (opts.boardSize !== undefined) {
    if (opts.boardSize === 'infinity') return 'Field: ∞';
    return `Field: ${opts.boardSize}×${opts.boardSize}`;
  }
  if (opts.gridSize !== undefined)
    return `Grid: ${opts.gridSize}×${opts.gridSize}`;
  if (gameId === 'checkers_v1') {
    const mode = (opts.mode as string) ?? 'american';
    return mode === 'international' ? 'Board: 10×10' : 'Board: 8×8';
  }
  return null;
}

/** Wrap `onStart` so it always receives `botDifficulty` (default medium). */
export function withBotDifficulty<T extends object>(
  onStart: (o?: LobbyStartOptions & { botDifficulty: string }) => T | void,
) {
  return (opts?: LobbyStartOptions) =>
    onStart({ ...opts, botDifficulty: opts?.difficulty ?? 'medium' });
}

/** Wrap `onStart` so `difficulty` always has a value (default medium). */
export function withDifficultyDefault(
  onStart: (o?: LobbyStartOptions & { difficulty: LobbyBotDifficulty }) => void,
) {
  return (opts?: LobbyStartOptions) =>
    onStart({ ...opts, difficulty: opts?.difficulty ?? 'medium' });
}

/** Forward only the bot options (drops difficulty). */
export function pickBotOptions(
  onStart: (o?: { withBots?: boolean; botCount?: number }) => void,
) {
  return (opts?: LobbyStartOptions) =>
    onStart({ withBots: opts?.withBots, botCount: opts?.botCount });
}

/** Build the standard "table" label set from an i18n key prefix. */
export function buildTableLabels(
  t: (key: string) => string,
  prefix = 'games.table',
): LobbyLabels {
  return {
    waitingLabel: t(`${prefix}.lobby.waitingToStart`),
    playersLabel: t(`${prefix}.lobby.players`),
    hostControlsLabel: t(`${prefix}.lobby.hostControls`),
    startLabel: t(`${prefix}.actions.start`),
    startingLabel: t(`${prefix}.actions.starting`),
    roomInfoLabel: t(`${prefix}.lobby.roomInfo`),
  };
}

/** Room-info/visibility/invite labels for the standard "table" lobby. */
export function buildTableRoomInfoLabels(
  t: (key: string) => string,
  prefix = 'games.table',
): LobbyLabels {
  return {
    statusLabel: t(`${prefix}.lobby.status`),
    visibilityLabel: t(`${prefix}.lobby.visibility`),
    visibilityPublicLabel: t(`${prefix}.lobby.visibilityPublic`),
    visibilityPrivateLabel: t(`${prefix}.lobby.visibilityPrivate`),
    inviteCodeLabel: t(`${prefix}.lobby.inviteCode`),
    waitingForPlayerLabel: t(`${prefix}.lobby.waitingForPlayer`),
    invitedPlayersLabel: t(`${prefix}.lobby.invitedPlayers`),
    declinedLabel: t(`${prefix}.lobby.statusDeclined`),
    reinviteLabel: t(`${prefix}.lobby.reinvite`),
  };
}

/** Shared bot/fast-room labels (games.lobby.* and games.rooms.fastRoom). */
export function buildBotLabels(t: (key: string) => string): LobbyLabels {
  return {
    fastRoomLabel: t('games.rooms.fastRoom'),
    botCountLabel: t('games.lobby.botCountLabel'),
    startWithBotsLabel: t('games.lobby.startWithBots'),
  };
}
