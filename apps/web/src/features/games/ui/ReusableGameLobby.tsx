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
import { LobbyMobileHeader } from './LobbyMobileHeader';
import { LobbyMobileSidebar } from './LobbyMobileSidebar';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import { useRankingStore } from '@/features/ranking/store/rankingStore';
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
  showDifficulty = true,
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
    difficultyExpertLabel = 'Expert',
    deleteRoomLabel,
  } = labels;
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const myRating = useRankingStore((s) => s.ratings[room.gameId]);
  const loadMyRankings = useRankingStore((s) => s.loadMyRankings);

  useEffect(() => {
    if (userId) void loadMyRankings(userId);
  }, [userId, loadMyRankings]);

  const isRanked = room.gameOptions?.ranked === true;

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
        for (const r of game.rules) map.set(r.ruleId, r.comingSoon);
        setRuleComingSoon(map);
        onRuleComingSoonChange?.(map);
      })
      .catch(() => {});
  }, [room.gameId, onRuleComingSoonChange]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const members = room.members ?? [];
  const maxPlayers = maxPlayersProp ?? room.maxPlayers ?? 6;
  const [botCount, setBotCount] = useState(() =>
    Math.max(1, Math.min(minPlayers - 1, maxPlayers - 1)),
  );
  const [difficulty, setDifficulty] = useState<
    'easy' | 'medium' | 'hard' | 'expert'
  >(() => {
    const settings = loadStoredSettings();
    return settings.aiDifficulty ?? 'medium';
  });
  const cooldownRef = React.useRef(0);

  useEffect(() => {
    saveStoredSettings({ aiDifficulty: difficulty });
    if (enableBots && isHost && room.status === 'lobby') {
      setOption({ aiDifficulty: difficulty });
    }
  }, [difficulty, enableBots, isHost, room.status, setOption]);

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

  const handleDeleteClose = useCallback(() => setShowDeleteConfirm(false), []);
  const handleDeleteConfirm = useCallback(() => {
    onDeleteRoom?.();
    setShowDeleteConfirm(false);
  }, [onDeleteRoom]);
  const handleDeleteClick = useCallback(() => setShowDeleteConfirm(true), []);

  const defaultSubtitle = useMemo(() => {
    if (room.status !== 'lobby') return 'Loading...';
    if (enableBots && room.playerCount === 1)
      return 'Single player mode available';
    if (room.playerCount < minPlayers)
      return `Need at least ${minPlayers} players`;
    if (isHost) return "Click 'Start Game' when ready";
    return 'Waiting for host to start...';
  }, [room.status, enableBots, room.playerCount, minPlayers, isHost]);

  const visualTheme =
    (room.gameOptions?.theme as string | undefined) ??
    (room.gameOptions?.variant as string | undefined) ??
    'cyberpunk';

  const showHostBots =
    isHost && room.status === 'lobby' && enableBots && room.playerCount === 1;

  return (
    <GameContainer ref={containerRef} theme={visualTheme}>
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

      {/* Desktop Header */}
      <GameHeader className="max-[800px]:hidden">
        <GameInfo>
          <GameTitleText gradient={theme.titleGradient}>
            {gameName}
            {variantName && (
              <VariantText
                gradient={theme.variantGradient}
              >{` : ${variantName}`}</VariantText>
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
          {isRanked && (
            <span
              data-testid="lobby-ranked-badge"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#facc15] bg-[rgba(250,204,21,0.18)] text-[#ffd700] shadow-[0_4px_12px_rgba(250,204,21,0.25)] shrink-0"
            >
              <span className="text-[12px]">★</span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.8px]">
                {t('games.rooms.ranked')}
              </span>
            </span>
          )}
          {isRanked && myRating && (
            <RatingBadge elo={myRating.elo} tier={myRating.tier} size="sm" />
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

      {/* Mobile Header */}
      <LobbyMobileHeader
        gameIcon={gameIcon}
        gameName={gameName}
        variantName={variantName}
        roomName={room.name}
        isFastMode={isFastMode}
        isRanked={isRanked}
        myRating={myRating}
        headerActionsSlot={headerActionsSlot}
      />

      <LobbyContent>
        {/* Mobile: compact status bar */}
        <LobbyMobileSidebar
          room={room}
          minPlayers={minPlayers}
          maxPlayers={maxPlayers}
        />

        {/* Center column: desktop header + settings (single instance) */}
        <div className="flex flex-col flex-1 min-w-0 max-w-full max-[1023px]:flex-[0] max-[1023px]:min-h-[unset] max-[1023px]:w-full max-[1023px]:order-2">
          <CenterSection
            style={slideInStyle as never}
            className="max-[1023px]:hidden"
          >
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
          </CenterSection>

          {/* Settings: host controls, theme picker, house rules — single instance */}
          {isHost && room.status === 'lobby' && (
            <HostControls className="max-[1023px]:mx-3">
              <HostLabel>{hostControlsLabel}</HostLabel>
              {showHostBots && (
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
              {showHostBots && showDifficulty && (
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
                        {
                          key: 'hard',
                          label: difficultyHardLabel || 'Hard',
                        },
                        {
                          key: 'expert',
                          label: difficultyExpertLabel || 'Expert',
                        },
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
              {enableBots && showDifficulty && (
                <span
                  data-testid="difficulty-badge"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.12)] px-3 py-1 text-[12px] font-semibold text-[#a5b4fc]"
                >
                  🤖{' '}
                  {difficulty === 'easy'
                    ? difficultyEasyLabel || 'Easy'
                    : difficulty === 'hard'
                      ? difficultyHardLabel || 'Hard'
                      : difficulty === 'expert'
                        ? difficultyExpertLabel || 'Expert'
                        : difficultyMediumLabel || 'Medium'}
                </span>
              )}
            </HostControls>
          )}

          {/* Theme picker + game rules — single instance */}
          <div className="w-full">{optionsSlot}</div>

          {/* Generic lobby rules — single instance */}
          {isHost && room.status === 'lobby' && (
            <div className="max-[1023px]:px-3">
              <HouseRulesSection
                room={room}
                ruleComingSoon={ruleComingSoon}
                onSetOption={setOption}
              />
            </div>
          )}
        </div>

        {/* Player sidebar — single instance */}
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
