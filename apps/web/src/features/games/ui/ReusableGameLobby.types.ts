import type React from 'react';

export interface GameLobbyTheme {
  titleGradient?: string;
  variantGradient?: string;
  buttonGradient?: string;
}

export interface ReusableGameLobbyProps {
  // Core props
  room: import('@/shared/types/games').GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  startDisabled?: boolean;
  isFullscreen?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  onToggleFullscreen?: () => void;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  onRefresh?: () => void;

  // Game info
  gameName: string;
  gameIcon: string;
  variantName?: string;
  roomIcon?: string;

  // Player limits
  minPlayers?: number;
  maxPlayers?: number;

  // Labels (with sensible defaults)
  labels?: {
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
    deleteRoomLabel?: string;
    kickPlayerLabel?: string;
    leaveRoomLabel?: string;
  };
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

  // Catalog rule visibility — fired once after catalog loads so game-specific
  // lobbies can disable/exclude options without fetching the catalog themselves.
  onRuleComingSoonChange?: (map: Map<string, boolean>) => void;
}
