'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { gamesApi } from '@/features/games/api';
import {
  loadStoredSettings,
  saveStoredSettings,
} from '@/shared/lib/settings-storage';
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
import { LobbyStartButton } from './LobbyStartButton';
import { LobbySidebar } from './LobbySidebar';
import { ConfirmationModal } from './ConfirmationModal';
import { HouseRulesSection } from './HouseRulesSection';
import type { ReusableGameLobbyProps } from './ReusableGameLobby.types';

// Re-export all styles for games to use
export * from './lobbyStyles';
export type {
  GameLobbyTheme,
  ReusableGameLobbyProps,
} from './ReusableGameLobby.types';

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
  userId,
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
  maxPlayers: maxPlayersProp,
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
  onRuleComingSoonChange,
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
    difficultyLabel = 'AI Difficulty',
    difficultyEasyLabel = 'Easy',
    difficultyMediumLabel = 'Medium',
    difficultyHardLabel = 'Hard',
    deleteRoomLabel,
  } = labels;
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  // Fetch catalog to determine which rules are excluded
  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );
  React.useEffect(() => {
    gamesApi
      .getCatalog()
      .then((catalog) => {
        const game = catalog.games.find((g) => g.gameId === room.gameId);
        if (!game) return;
        const map = new Map<string, boolean>();
        for (const r of game.rules) {
          map.set(r.ruleId, r.comingSoon);
        }
        setRuleComingSoon(map);
        onRuleComingSoonChange?.(map);
      })
      .catch(() => {});
  }, [room.gameId, onRuleComingSoonChange]);

  const [botCount, setBotCount] = useState(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    () => {
      const settings = loadStoredSettings();
      return settings.aiDifficulty ?? 'medium';
    },
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const members = room.members ?? [];
  const maxPlayers = maxPlayersProp ?? room.maxPlayers ?? 6;
  const cooldownRef = React.useRef(0);

  useEffect(() => {
    saveStoredSettings({ aiDifficulty: difficulty });
  }, [difficulty]);

  const handleStart = React.useCallback(() => {
    const now = Date.now();
    if (now - cooldownRef.current < 1000) return;
    cooldownRef.current = now;

    if (enableBots && room.playerCount === 1) {
      onStartGame({ withBots: true, botCount, difficulty });
    } else {
      onStartGame();
    }
  }, [enableBots, room.playerCount, botCount, difficulty, onStartGame]);

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
            className={
              theme.titleGradient ? 'text-gradient shimmer-animated' : undefined
            }
            style={{
              background: theme.titleGradient,
              ...(theme.titleGradient ? { backgroundSize: '200% auto' } : {}),
            }}
          >
            {gameName}
            {variantName && (
              <>
                {' '}
                <VariantText
                  className={
                    theme.variantGradient
                      ? 'text-gradient shimmer-animated'
                      : undefined
                  }
                  style={{
                    background: theme.variantGradient,
                    ...(theme.variantGradient
                      ? { backgroundSize: '200% auto' }
                      : {}),
                  }}
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
                        active={botCount === count}
                        onClick={() => setBotCount(count)}
                      >
                        {count}
                      </BotCountButton>
                    ))}
                  </BotCountButtons>
                </BotCountSelector>
              )}
              {enableBots && room.playerCount === 1 && (
                <BotCountSelector>
                  <BotCountLabel>
                    {difficultyLabel || 'AI Difficulty'}
                  </BotCountLabel>
                  <BotCountButtons>
                    {(
                      [
                        { key: 'easy', label: difficultyEasyLabel || 'Easy' },
                        {
                          key: 'medium',
                          label: difficultyMediumLabel || 'Medium',
                        },
                        { key: 'hard', label: difficultyHardLabel || 'Hard' },
                      ] as const
                    ).map((d) => (
                      <BotCountButton
                        key={d.key}
                        data-testid={`difficulty-${d.key}`}
                        active={difficulty === d.key}
                        onClick={() => setDifficulty(d.key)}
                      >
                        {d.label}
                      </BotCountButton>
                    ))}
                  </BotCountButtons>
                </BotCountSelector>
              )}
            </HostControls>
          )}

          {optionsSlot}

          {isHost && room.status === 'lobby' && (
            <HouseRulesSection
              room={room}
              ruleComingSoon={ruleComingSoon}
              onSetOption={setOption}
            />
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

      {isHost && room.status === 'lobby' && (
        <LobbyStartButton
          startBusy={startBusy}
          startDisabled={startDisabled}
          enableBots={enableBots}
          playerCount={room.playerCount}
          minPlayers={minPlayers || 2}
          botCount={botCount}
          startLabel={startLabel}
          startingLabel={startingLabel}
          startWithBotsLabel={startWithBotsLabel}
          onStart={handleStart}
        />
      )}
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
