import type React from 'react';

export interface GameLobbyTheme {
  titleGradient?: string;
  variantGradient?: string;
  buttonGradient?: string;
}

export interface LobbyLabels {
  waitingLabel?: string;
  subtitleText?: string;
  playersLabel?: string;
  hostControlsLabel?: string;
  startLabel?: string;
  startingLabel?: string;
  roomInfoLabel?: string;
  statusLabel?: string;
  visibilityLabel?: string;
  visibilityPublicLabel?: string;
  visibilityPrivateLabel?: string;
  inviteCodeLabel?: string;
  waitingForPlayerLabel?: string;
  invitedPlayersLabel?: string;
  declinedLabel?: string;
  reinviteLabel?: string;
  fastRoomLabel?: string;
  botCountLabel?: string;
  startWithBotsLabel?: string;
  difficultyLabel?: string;
  difficultyEasyLabel?: string;
  difficultyMediumLabel?: string;
  difficultyHardLabel?: string;
  difficultyExpertLabel?: string;
  deleteRoomLabel?: string;
  kickPlayerLabel?: string;
  leaveRoomLabel?: string;
}

export type LobbyBotDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface LobbyStartOptions {
  withBots?: boolean;
  botCount?: number;
  difficulty?: LobbyBotDifficulty;
}

export interface ReusableGameLobbyProps {
  /** Per-game static config. Flat props below override config values. */
  config?: import('./lobbyConfig').GameLobbyConfig;

  // Core props
  room: import('@/shared/types/games').GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  startDisabled?: boolean;
  isFullscreen?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  onToggleFullscreen?: () => void;
  onStartGame: (options?: LobbyStartOptions) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  onRefresh?: () => void;

  // Game info
  gameName?: string;
  gameIcon?: string;
  variantName?: string;
  roomIcon?: string;

  // Player limits
  minPlayers?: number;
  maxPlayers?: number;

  // Labels (with sensible defaults)
  labels?: LobbyLabels;

  // Theme
  theme?: GameLobbyTheme;

  // Fast mode
  isFastMode?: boolean;

  // Slots for game-specific content
  optionsSlot?: React.ReactNode;
  headerActionsSlot?: React.ReactNode;
  rulesModalSlot?: React.ReactNode;
  extraPlayersCardSlot?: React.ReactNode;

  // Enable/disable features
  showFullscreenButton?: boolean;
  showReorderControls?: boolean;
  showInvitedPlayers?: boolean;
  enableBots?: boolean;
  /** Show the AI difficulty selector + badge when bots are enabled. Default true. */
  showDifficulty?: boolean;

  // Catalog rule visibility — fired once after catalog loads so game-specific
  // lobbies can disable/exclude options without fetching the catalog themselves.
  onRuleComingSoonChange?: (map: Map<string, boolean>) => void;
}

/** Start options a game-specific start handler may receive after adapting. */
export interface LobbyBotStartOptions {
  withBots?: boolean;
  botCount?: number;
  botDifficulty?: string;
}

/**
 * Props every per-game lobby wrapper receives from its game page. `TStart`
 * is the start-options shape the game's own start handler accepts.
 */
export interface GameLobbyHostProps<TStart = LobbyStartOptions> {
  room: import('@/shared/types/games').GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: TStart) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
}
