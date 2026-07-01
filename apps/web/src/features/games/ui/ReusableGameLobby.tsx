'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { TamaguiElement, YStack, XStack, Text, Switch } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { gamesApi } from '@/features/games/api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  LobbyContent,
  CenterSection,
  GameIcon,
  LobbyTitle,
  LobbySubtitle,
  ProgressWrapper,
  ProgressLabel,
  ProgressBar,
  ProgressFill,
  WaitingDots,
  Dot,
  HostControls,
  HostLabel,
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
  FastBadge,
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitleText,
  VariantText,
  HeaderActions,
  IconButton,
  StartButton,
  DeleteButton,
  BotCountSelector,
  BotCountLabel,
  BotCountButtons,
  BotCountButton,
} from './lobbyStyles';
import { LobbySidebar } from './LobbySidebar';
import { ConfirmationModal } from './ConfirmationModal';

// Re-export all styles for games to use
export * from './lobbyStyles';

// ============ Types ============

export interface GameLobbyTheme {
  titleGradient?: string;
  variantGradient?: string;
  buttonGradient?: string;
}

export interface ReusableGameLobbyProps {
  // Core props
  room: GameRoomSummary;
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

// Styles

const floatStyle: React.CSSProperties = {
  animation: 'float 3s ease-in-out infinite',
};

const slideInStyle: React.CSSProperties = {
  animation: 'slideIn 0.5s ease-out both',
};

const slideInDelayedStyle: React.CSSProperties = {
  animation: 'slideIn 0.5s ease-out 0.15s both',
};

const dotPulseStyle = (delayMs: number): React.CSSProperties => ({
  animation: `dotPulse 1.4s ease-in-out ${delayMs}ms infinite`,
});

// ============ Component ============

export function ReusableGameLobby({
  room,
  isHost,
  startBusy,
  startDisabled = false,
  isFullscreen = false,
  containerRef,
  onToggleFullscreen,
  onStartGame,
  onReorderPlayers,
  onReinvite,
  onDeleteRoom,
  onKickPlayer,
  onLeaveRoom,
  onRefresh,
  gameName,
  gameIcon,
  variantName,
  roomIcon = '🎲',
  minPlayers = 2,
  theme = {},
  isFastMode,
  labels = {},
  optionsSlot,
  headerActionsSlot,
  rulesModalSlot,
  extraPlayersCardSlot,
  showFullscreenButton = true,
  showReorderControls = true,
  showInvitedPlayers = true,
  enableBots = false,
}: ReusableGameLobbyProps) {
  const {
    waitingLabel = 'Waiting for game to start...',
    subtitleText,
    playersLabel = 'Players',
    hostControlsLabel = 'Host Controls',
    startLabel = 'Start Game',
    startingLabel = 'Starting...',
    fastRoomLabel = 'Fast Room',
    botCountLabel = 'Number of bots',
    startWithBotsLabel = 'Start with {{count}} 🤖',
    deleteRoomLabel,
  } = labels;
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const [botCount, setBotCount] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const members = room.members ?? [];
  const maxPlayers = room.maxPlayers ?? 6;
  const cooldownRef = React.useRef(0);
  const handleStart = React.useCallback(() => {
    const now = Date.now();
    if (now - cooldownRef.current < 1000) return;
    cooldownRef.current = now;

    if (enableBots && room.playerCount === 1) {
      onStartGame({ withBots: true, botCount });
    } else {
      onStartGame();
    }
  }, [enableBots, room.playerCount, botCount, onStartGame]);

  const progress = Math.round((room.playerCount / maxPlayers) * 100);

  const deleteRoomTranslations = useMemo(
    () => ({
      button: t('games.common.deleteRoom.button'),
      confirmTitle: t('games.common.deleteRoom.confirmTitle'),
      confirmMessage: t('games.common.deleteRoom.confirmMessage'),
      confirmButton: t('games.common.deleteRoom.confirmButton'),
      cancelButton: t('games.common.deleteRoom.cancelButton'),
    }),
    [t],
  );

  const handleDeleteClose = useCallback(() => {
    setShowDeleteConfirm(false);
  }, [setShowDeleteConfirm]);

  const handleDeleteConfirm = useCallback(() => {
    onDeleteRoom?.();
    setShowDeleteConfirm(false);
  }, [onDeleteRoom, setShowDeleteConfirm]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, [setShowDeleteConfirm]);

  const defaultSubtitle = useMemo(() => {
    if (room.status !== 'lobby') {
      return 'Loading...';
    }
    if (enableBots && room.playerCount === 1) {
      return 'Single player mode available';
    }
    if (room.playerCount < minPlayers) {
      return `Need at least ${minPlayers} players`;
    }
    if (isHost) {
      return "Click 'Start Game' when ready";
    }
    return 'Waiting for host to start...';
  }, [room.status, enableBots, room.playerCount, minPlayers, isHost]);

  return (
    <GameContainer ref={containerRef}>
      {rulesModalSlot}

      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title={deleteRoomTranslations.confirmTitle}
        message={deleteRoomTranslations.confirmMessage}
        confirmLabel={deleteRoomTranslations.confirmButton}
        cancelLabel={deleteRoomTranslations.cancelButton}
      />

      <GameHeader>
        <GameInfo>
          <GameTitleText
            background={theme.titleGradient}
            className={
              theme.titleGradient ? 'text-gradient shimmer-animated' : undefined
            }
            style={theme.titleGradient ? { backgroundSize: '200% auto' } : {}}
          >
            {gameName}
            {variantName && (
              <>
                {' '}
                <VariantText
                  background={theme.variantGradient}
                  className={
                    theme.variantGradient
                      ? 'text-gradient shimmer-animated'
                      : undefined
                  }
                  style={
                    theme.variantGradient ? { backgroundSize: '200% auto' } : {}
                  }
                >
                  : {variantName}
                </VariantText>
              </>
            )}
          </GameTitleText>
          <RoomNameBadge>
            <RoomNameIcon>{roomIcon}</RoomNameIcon>
            <RoomNameText data-testid="room-name-text">
              {room.name}
            </RoomNameText>
          </RoomNameBadge>
          {isFastMode && (
            <FastBadge>
              <span>⚡</span>
              <span>{fastRoomLabel}</span>
            </FastBadge>
          )}
        </GameInfo>
        <HeaderActions>
          {headerActionsSlot}
          {showFullscreenButton && onToggleFullscreen && (
            <IconButton
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⤓' : '⤢'}
            </IconButton>
          )}
        </HeaderActions>
      </GameHeader>

      <LobbyContent>
        <CenterSection style={slideInStyle as never}>
          <GameIcon style={floatStyle as never}>{gameIcon}</GameIcon>
          <LobbyTitle style={slideInDelayedStyle as never}>
            {waitingLabel}
          </LobbyTitle>
          <LobbySubtitle>{subtitleText || defaultSubtitle}</LobbySubtitle>

          <ProgressWrapper>
            <ProgressLabel>
              <span>{playersLabel} in Lobby</span>
              <span>
                {room.playerCount} / {maxPlayers}
              </span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill width={`${progress}%`} />
            </ProgressBar>
          </ProgressWrapper>

          <WaitingDots>
            <Dot style={dotPulseStyle(0) as never} />
            <Dot style={dotPulseStyle(200) as never} />
            <Dot style={dotPulseStyle(400) as never} />
          </WaitingDots>

          {isHost && room.status === 'lobby' && (
            <HostControls>
              <HostLabel>{hostControlsLabel}</HostLabel>
              {enableBots && room.playerCount === 1 && (
                <BotCountSelector>
                  <BotCountLabel>{botCountLabel}</BotCountLabel>
                  <BotCountButtons>
                    {Array.from(
                      { length: maxPlayers - 1 },
                      (_, i) => i + 1,
                    ).map((count) => (
                      <BotCountButton
                        key={count}
                        data-testid={`bot-count-${count}`}
                        $isActive={botCount === count}
                        onClick={() => setBotCount(count)}
                      >
                        {count}
                      </BotCountButton>
                    ))}
                  </BotCountButtons>
                </BotCountSelector>
              )}
              <StartButton
                onClick={handleStart}
                disabled={
                  startBusy ||
                  startDisabled ||
                  (room.playerCount < (minPlayers || 2) &&
                    !(enableBots && room.playerCount === 1))
                }
                data-testid="start-with-bots-button"
              >
                {startBusy
                  ? startingLabel
                  : enableBots && room.playerCount === 1
                    ? startWithBotsLabel.replace(
                        '{{count}}',
                        botCount.toString(),
                      )
                    : startLabel}
              </StartButton>
            </HostControls>
          )}

          {optionsSlot}

          {isHost && room.status === 'lobby' && (
            <YStack gap="$3" paddingTop="$2">
              <Text fontSize="$4" fontWeight="600">
                {t('games.create.sectionHouseRules') || 'House Rules'}
              </Text>
              <XStack alignItems="center" gap="$2">
                <Switch
                  checked={!!room.gameOptions?.idleTimerAutoplay}
                  onCheckedChange={(val) =>
                    gamesApi.updateRoomOptions(room.id, { idleTimerAutoplay: val }, { token: snapshot?.accessToken ?? undefined })
                  }
                  size="$2"
                >
                  <Switch.Thumb />
                </Switch>
                <Text fontSize="$3">
                  {t('games.create.rules.idle.title') || 'Idle timer autoplay'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Switch
                  checked={room.gameOptions?.allowSpectators !== false}
                  onCheckedChange={(val) =>
                    gamesApi.updateRoomOptions(room.id, { allowSpectators: val }, { token: snapshot?.accessToken ?? undefined })
                  }
                  size="$2"
                >
                  <Switch.Thumb />
                </Switch>
                <Text fontSize="$3">
                  {t('games.create.rules.spectators.title') || 'Allow spectators'}
                </Text>
              </XStack>
            </YStack>
          )}
        </CenterSection>

        <LobbySidebar
          room={room}
          isHost={isHost}
          minPlayers={minPlayers}
          isFastMode={isFastMode}
          showReorderControls={showReorderControls}
          showInvitedPlayers={showInvitedPlayers}
          members={members}
          onReorderPlayers={onReorderPlayers}
          onReinvite={onReinvite}
          onDeleteRoom={isHost ? handleDeleteClick : undefined}
          onKickPlayer={isHost ? onKickPlayer : undefined}
          onLeaveRoom={!isHost ? onLeaveRoom : undefined}
          deleteRoomLabel={deleteRoomLabel || deleteRoomTranslations.button}
          extraPlayersCardSlot={extraPlayersCardSlot}
          onRefresh={onRefresh}
          labels={labels}
        />
      </LobbyContent>
    </GameContainer>
  );
}

// Export commonly used components
export {
  GameContainer,
  GameHeader,
  GameInfo,
  GameTitleText,
  VariantText,
  HeaderActions,
  IconButton,
  StartButton,
  DeleteButton,
};
