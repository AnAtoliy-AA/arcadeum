'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { gamesApi } from '@/features/games/api';
import {
  loadStoredSettings,
  saveStoredSettings,
} from '@/shared/lib/settings-storage';
import { gameSocket } from '@/shared/lib/socket';
import {
  LobbyContent,
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
} from './lobbyStyles';
import { LobbyStartButton } from './LobbyStartButton';
import { LobbySidebar } from './LobbySidebar';
import { ConfirmationModal } from './ConfirmationModal';
import { useMatchmaking } from './MatchmakingQueue';
import { LobbyHeroSection } from './LobbyHeroSection';
import { LobbySetupSection } from './LobbySetupSection';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import { useRankingStore } from '@/features/ranking/store/rankingStore';
import type { ReusableGameLobbyProps } from './ReusableGameLobby.types';

export * from './lobbyStyles';
export { LobbyHeroSection } from './LobbyHeroSection';
export { LobbySetupSection } from './LobbySetupSection';
export type {
  GameLobbyTheme,
  ReusableGameLobbyProps,
} from './ReusableGameLobby.types';

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
  const { isQueued, joinQueue, leaveQueue } = useMatchmaking();
  const myRating = useRankingStore((s) => s.ratings[room.gameId]);
  const loadMyRankings = useRankingStore((s) => s.loadMyRankings);

  useEffect(() => {
    if (userId) void loadMyRankings(userId);
  }, [userId, loadMyRankings]);

  const isRanked = room.gameOptions?.ranked === true;

  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );
  useEffect(() => {
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
  const cooldownRef = useRef(0);
  useEffect(() => {
    saveStoredSettings({ aiDifficulty: difficulty });
    if (enableBots && isHost && room.status === 'lobby') {
      setOption({ aiDifficulty: difficulty });
    }
  }, [difficulty, enableBots, isHost, room.status, setOption]);

  const handleStart = useCallback(() => {
    const now = Date.now();
    if (now - cooldownRef.current < 1000) return;
    cooldownRef.current = now;
    if (enableBots && room.playerCount === 1) {
      onStartGame({ withBots: true, botCount, difficulty });
    } else {
      onStartGame();
    }
  }, [enableBots, room.playerCount, botCount, difficulty, onStartGame]);

  const handleAddBot = useCallback(() => {
    gameSocket.emit('games.room.add_bot', {
      roomId: room.id,
      userId,
    });
  }, [room.id, userId]);

  const handleRemoveBot = useCallback(
    (botId: string) => {
      gameSocket.emit('games.room.remove_bot', {
        roomId: room.id,
        userId,
        botId,
      });
    },
    [room.id, userId],
  );

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

  const handleToggleQueue = useCallback(() => {
    if (isQueued) {
      leaveQueue();
    } else {
      const variant = (room.gameOptions?.variant as string) || undefined;
      joinQueue(room.gameId, variant);
    }
  }, [isQueued, leaveQueue, joinQueue, room.gameId, room.gameOptions?.variant]);

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

      <GameHeader>
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

      <LobbyContent>
        <div className="flex flex-col flex-1 min-w-0 max-w-full gap-5 max-[1023px]:w-full max-[1023px]:order-2">
          <LobbyHeroSection
            gameName={gameName}
            gameIcon={gameIcon}
            variantName={variantName}
            waitingLabel={waitingLabel}
            subtitleText={subtitleText}
            defaultSubtitle={defaultSubtitle}
            playersLabel={playersLabel}
            playerCount={room.playerCount}
            maxPlayers={maxPlayers}
            progress={progress}
            roomStatus={room.status}
            isQueued={isQueued}
            onToggleQueue={handleToggleQueue}
            findOpponentLabel={t('games.matchmaking.findOpponent')}
            cancelQueueLabel={t('games.matchmaking.cancel')}
            queueSearchingSubtitle={t('games.matchmaking.searchingSubtitle', {
              game: gameName,
            })}
            findOpponentHint={t('games.matchmaking.findOpponentHint')}
          />

          <LobbySetupSection
            room={room}
            isHost={isHost}
            optionsSlot={optionsSlot}
            enableBots={enableBots}
            showDifficulty={showDifficulty}
            showHostBots={showHostBots}
            maxPlayers={maxPlayers}
            botCount={botCount}
            setBotCount={setBotCount}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            ruleComingSoon={ruleComingSoon}
            setOption={setOption}
            hostControlsLabel={hostControlsLabel}
            botCountLabel={botCountLabel}
            difficultyLabel={difficultyLabel}
            difficultyEasyLabel={difficultyEasyLabel}
            difficultyMediumLabel={difficultyMediumLabel}
            difficultyHardLabel={difficultyHardLabel}
            difficultyExpertLabel={difficultyExpertLabel}
          />
        </div>

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
          enableBots={enableBots}
          onAddBot={
            isHost && room.status === 'lobby' ? handleAddBot : undefined
          }
          onRemoveBot={
            isHost && room.status === 'lobby' ? handleRemoveBot : undefined
          }
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
