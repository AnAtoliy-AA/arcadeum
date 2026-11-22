'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  GameContainer,
  LobbyContent,
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
import { LobbyHeaderBar } from './LobbyHeaderBar';
import { useLobbyBots } from './useLobbyBots';
import { useLobbyCatalogRules } from './useLobbyCatalogRules';
import {
  getDefaultSubtitle,
  getFieldSizeBadge,
  resolveLobbyConfig,
} from './lobbyConfig';
import { useRankingStore } from '@/features/ranking/store/rankingStore';
import type { ReusableGameLobbyProps } from './ReusableGameLobby.types';

export * from './lobbyStyles';
export { LobbyHeroSection } from './LobbyHeroSection';
export { LobbySetupSection } from './LobbySetupSection';
export type {
  GameLobbyTheme,
  LobbyLabels,
  LobbyStartOptions,
  ReusableGameLobbyProps,
} from './ReusableGameLobby.types';
export type { GameLobbyConfig } from './lobbyConfig';

export function ReusableGameLobby(props: ReusableGameLobbyProps) {
  const {
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
    isFastMode,
    optionsSlot,
    headerActionsSlot,
    rulesModalSlot,
    extraPlayersCardSlot,
    onRuleComingSoonChange,
  } = props;
  const {
    gameName,
    gameIcon,
    roomIcon,
    variantName,
    theme,
    labels,
    minPlayers,
    maxPlayers: maxPlayersProp,
    enableBots,
    showDifficulty,
    showFullscreenButton,
    showReorderControls,
    showInvitedPlayers,
  } = resolveLobbyConfig(props);
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
  const { isQueued, joinQueue, leaveQueue } = useMatchmaking();
  const myRating = useRankingStore((s) => s.ratings[room.gameId]);
  const loadMyRankings = useRankingStore((s) => s.loadMyRankings);

  useEffect(() => {
    if (userId) void loadMyRankings(userId);
  }, [userId, loadMyRankings]);

  const isRanked = room.gameOptions?.ranked === true;
  const ruleComingSoon = useLobbyCatalogRules(
    room.gameId,
    onRuleComingSoonChange,
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const members = room.members ?? [];
  const maxPlayers = maxPlayersProp ?? room.maxPlayers ?? 6;
  const {
    setOption,
    botCount,
    setBotCount,
    difficulty,
    setDifficulty,
    handleStart,
    handleAddBot,
    handleRemoveBot,
  } = useLobbyBots({
    roomId: room.id,
    userId,
    roomStatus: room.status,
    playerCount: room.playerCount,
    isHost,
    enableBots,
    minPlayers,
    maxPlayers,
    onStartGame,
  });

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

  const defaultSubtitle = getDefaultSubtitle({
    status: room.status,
    enableBots,
    playerCount: room.playerCount,
    minPlayers,
    isHost,
  });

  const visualTheme =
    (room.gameOptions?.theme as string | undefined) ??
    (room.gameOptions?.variant as string | undefined) ??
    'cyberpunk';

  const showHostBots =
    isHost && room.status === 'lobby' && enableBots && room.playerCount === 1;

  const fieldSizeBadgeText = useMemo(
    () => getFieldSizeBadge(room.gameId, room.gameOptions),
    [room.gameOptions, room.gameId],
  );

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

      <LobbyHeaderBar
        gameName={gameName}
        variantName={variantName}
        roomName={room.name}
        roomIcon={roomIcon}
        theme={theme}
        isFastMode={isFastMode}
        fastRoomLabel={fastRoomLabel}
        fieldSizeBadgeText={fieldSizeBadgeText}
        isRanked={isRanked}
        myRating={myRating}
        headerActionsSlot={headerActionsSlot}
        showFullscreenButton={showFullscreenButton}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

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
