'use client';

import React, { useMemo, useState } from 'react';
import type { GameRoomSummary } from '@/shared/types/games';
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
  BotCountSelector,
  BotCountLabel,
  BotCountButtons,
  BotCountButton,
} from './lobbyStyles';
import { LobbySidebar } from './LobbySidebar';

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
  isFullscreen?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onToggleFullscreen?: () => void;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;

  // Game info
  gameName: string;
  gameIcon: string;
  variantName?: string;
  roomIcon?: string;

  // Player limits
  minPlayers?: number;

  // Labels (with sensible defaults)
  waitingLabel?: string;
  subtitleText?: string;
  playersLabel?: string;
  hostControlsLabel?: string;
  startLabel?: string;
  startingLabel?: string;
  roomInfoLabel?: string;
  statusLabel?: string;
  statusWaitingLabel?: string;
  statusActiveLabel?: string;
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
  showVariantSelector?: boolean;
  showRulesButton?: boolean;
  showFullscreenButton?: boolean;
  showReorderControls?: boolean;
  showInvitedPlayers?: boolean;
  enableBots?: boolean;
}

// ============ Component ============

export function ReusableGameLobby({
  room,
  isHost,
  startBusy,
  isFullscreen = false,
  containerRef,
  onToggleFullscreen,
  onStartGame,
  onReorderPlayers,
  onReinvite,
  gameName,
  gameIcon,
  variantName,
  roomIcon = '🎲',
  minPlayers = 2,
  waitingLabel = 'Waiting for game to start...',
  subtitleText,
  playersLabel = 'Players',
  hostControlsLabel = 'Host Controls',
  startLabel = 'Start Game',
  startingLabel = 'Starting...',
  roomInfoLabel = 'Room Info',
  statusLabel = 'Status',
  statusWaitingLabel = 'Waiting',
  statusActiveLabel = 'Active',
  visibilityLabel = 'Visibility',
  visibilityPublicLabel = 'Public',
  visibilityPrivateLabel = 'Private',
  inviteCodeLabel = 'Invite Code',
  waitingForPlayerLabel = 'Waiting for player...',
  invitedPlayersLabel = 'Invited Players',
  declinedLabel = 'Declined',
  reinviteLabel = 'Re-invite',
  fastRoomLabel = 'Fast Room',
  botCountLabel = 'Number of bots',
  startWithBotsLabel = 'Start with {{count}} 🤖',
  theme = {},
  isFastMode,
  optionsSlot,
  headerActionsSlot,
  rulesModalSlot,
  extraPlayersCardSlot,
  showFullscreenButton = true,
  showReorderControls = true,
  showInvitedPlayers = true,
  enableBots = false,
}: ReusableGameLobbyProps) {
  const [botCount, setBotCount] = useState(1);
  const members = room.members ?? [];
  const maxPlayers = room.maxPlayers ?? 6;
  const progress = Math.round((room.playerCount / maxPlayers) * 100);

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

      <GameHeader>
        <GameInfo>
          <GameTitleText $gradient={theme.titleGradient}>
            {gameName}
            {variantName && (
              <>
                {' '}
                <VariantText $gradient={theme.variantGradient}>
                  : {variantName}
                </VariantText>
              </>
            )}
          </GameTitleText>
          <RoomNameBadge>
            <RoomNameIcon>{roomIcon}</RoomNameIcon>
            <RoomNameText>{room.name}</RoomNameText>
          </RoomNameBadge>
          {isFastMode && (
            <FastBadge>
              <span>⚡</span>
              <span>{fastRoomLabel}</span>
            </FastBadge>
          )}
          {optionsSlot}
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
        <CenterSection>
          <GameIcon>{gameIcon}</GameIcon>
          <LobbyTitle>{waitingLabel}</LobbyTitle>
          <LobbySubtitle>{subtitleText || defaultSubtitle}</LobbySubtitle>

          <ProgressWrapper>
            <ProgressLabel>
              <span>{playersLabel} in Lobby</span>
              <span>
                {room.playerCount} / {maxPlayers}
              </span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill $percent={progress} />
            </ProgressBar>
          </ProgressWrapper>

          <WaitingDots>
            <Dot $delay={0} />
            <Dot $delay={0.2} />
            <Dot $delay={0.4} />
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
                        $active={botCount === count}
                        onClick={() => setBotCount(count)}
                      >
                        {count}
                      </BotCountButton>
                    ))}
                  </BotCountButtons>
                </BotCountSelector>
              )}
              <StartButton
                onClick={() => {
                  if (enableBots && room.playerCount === 1) {
                    onStartGame({ withBots: true, botCount });
                  } else {
                    onStartGame();
                  }
                }}
                disabled={
                  startBusy ||
                  (room.playerCount < (minPlayers || 2) &&
                    !(enableBots && room.playerCount === 1))
                }
                $gradient={theme?.buttonGradient}
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
        </CenterSection>

        <LobbySidebar
          room={room}
          isHost={isHost}
          minPlayers={minPlayers}
          isFastMode={isFastMode}
          playersLabel={playersLabel}
          invitedPlayersLabel={invitedPlayersLabel}
          declinedLabel={declinedLabel}
          reinviteLabel={reinviteLabel}
          roomInfoLabel={roomInfoLabel}
          statusLabel={statusLabel}
          statusWaitingLabel={statusWaitingLabel}
          statusActiveLabel={statusActiveLabel}
          visibilityLabel={visibilityLabel}
          visibilityPublicLabel={visibilityPublicLabel}
          visibilityPrivateLabel={visibilityPrivateLabel}
          inviteCodeLabel={inviteCodeLabel}
          waitingForPlayerLabel={waitingForPlayerLabel}
          fastRoomLabel={fastRoomLabel || 'Fast Mode'}
          showReorderControls={showReorderControls}
          showInvitedPlayers={showInvitedPlayers}
          members={members}
          onReorderPlayers={onReorderPlayers}
          onReinvite={onReinvite}
          extraPlayersCardSlot={extraPlayersCardSlot}
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
};
