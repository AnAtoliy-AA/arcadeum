import type React from 'react';
import type { TamaguiElement } from 'tamagui';

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
  containerRef?: React.RefObject<TamaguiElement | null>;
  onToggleFullscreen?: () => void;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
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
}
