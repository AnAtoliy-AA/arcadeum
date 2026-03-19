'use client';

import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { TamaguiElement } from 'tamagui';
import styled from 'styled-components';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { SeaBattleGameProps, SeaBattleSnapshot } from '../types';
import { MIN_PLAYERS } from '../types';
import { useSeaBattleState } from '../hooks/useSeaBattleState';
import { useSeaBattleActions } from '../hooks/useSeaBattleActions';
import { useGameStore } from '@/features/games/store/gameStore';
import { useDisplayNames } from '@/widgets/CriticalGame/lib/displayUtils';
import { useRematch } from '@/features/games/hooks';
import {
  GameResultModal,
  RematchModal,
  RematchInvitationModal,
} from '@/features/games/ui';

import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import { SeaBattleLobby } from './SeaBattleLobby';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { GameLayout } from '@/features/games/ui/GameLayout';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { getTheme } from '../lib/theme';

import { RulesModal } from './RulesModal';
import { GameChat, useGameChatStore, ChatMessagePopup, useLatestChatMessage } from '@/widgets/GameChat';
import { FullscreenButton } from '@/widgets/CriticalGame/ui/styles';
import {
  TurnIndicator,
  ChatToggleButton,
  CompactHeaderContainer,
  HeaderTitleArea,
} from './styles/header';

const RoomTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 1rem;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

export default function SeaBattleGame({
  roomId,
  room: initialRoom,
  currentUserId,
  session: initialSession,
  isHost,
  accessToken,
}: SeaBattleGameProps) {
  const { t } = useTranslation();

  const storeRoom = useGameStore((s) => s.room);
  const storeDeleteRoom = useGameStore((s) => s.deleteRoom);
  const storeRefreshRoom = useGameStore((s) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const containerRef = useRef<HTMLDivElement & TamaguiElement>(null);

  const isLobby = room?.status === 'lobby';

  const [showChat, setShowChat] = useState(true);
  const [showRules, setShowRules] = useState(isLobby);
  const [resultModalDismissed, setResultModalDismissed] = useState(false);

  const {
    startSession,
    placeShip,
    confirmPlacement,
    attack,
    resetPlacement,
    postHistoryNote: postHistoryNoteAction,
    autoPlace,
  } = useSeaBattleActions({
    roomId,
    userId: currentUserId,
  });

  const handleAutoPlace = useCallback(() => {
    autoPlace();
  }, [autoPlace]);

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const {
    snapshot,
    startBusy,
    isMyTurn,
    isPlacementPhase,
    isBattlePhase,
    currentPlayer,
    currentTurnPlayer,
    isPlacementComplete,
    isGameOver,
  } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

  // Sync snapshot logs into gameChatStore so GameChat can read them
  useEffect(() => {
    useGameChatStore.getState().setLogs(snapshot?.logs ?? []);
  }, [snapshot?.logs]);

  // Register send function; clear store on unmount
  useEffect(() => {
    if (!postHistoryNoteAction) return;
    useGameChatStore.getState().registerSendMessage(postHistoryNoteAction);
    return () => useGameChatStore.getState().clear();
  }, [postHistoryNoteAction]);

  const handleStartGame = useCallback(
    (options?: { withBots?: boolean; botCount?: number }) => {
      if (!room) return;
      const memberCount = room.members?.length || 0;
      if (
        memberCount >= MIN_PLAYERS ||
        (options?.withBots && memberCount >= 1)
      ) {
        startSession(options);
      }
    },
    [room, startSession],
  );

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
  );

  const {
    rematchLoading,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
    invitation,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useRematch({
    roomId,
    gameOptions: room?.gameOptions,
  });

  const handleOpenRematch = useCallback(() => {
    setResultModalDismissed(true);
    openRematchModal();
  }, [openRematchModal, setResultModalDismissed]);

  const { isWinner } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

  const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(
    snapshot?.logs ?? [],
  );

  const { resolveDisplayName } = useDisplayNames({
    currentUserId,
    room: room!,
    snapshot: snapshot as SeaBattleSnapshot,
    youLabel: t('games.sea_battle_v1.table.players.you'),
    translateCardType: () => '',
    seeTheFutureLabel: '',
  });

  const cardVariant = (room?.gameOptions?.variant ||
    room?.gameOptions?.cardVariant) as string | undefined;

  const getTurnStatusText = () => {
    if (!snapshot) return '';
    if (isGameOver) return t('games.sea_battle_v1.table.phase.completed');
    if (isPlacementPhase) {
      return isPlacementComplete
        ? t('games.sea_battle_v1.table.actions.waitingForOthers')
        : t('games.sea_battle_v1.table.players.placeShips');
    }
    if (!currentTurnPlayer) return '';
    if (currentTurnPlayer.playerId === currentUserId) {
      return t(
        'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
      ).replace('🎯 ', '');
    }
    return t('games.sea_battle_v1.table.players.waitingFor', {
      player: resolveDisplayName(currentTurnPlayer.playerId, 'opponent'),
    });
  };

  const currentVariant = SEA_BATTLE_VARIANTS.find((v) => v.id === cardVariant);
  const variantLabel = currentVariant
    ? `(${t(currentVariant.name as TranslationKey)})`
    : '';
  const theme = useMemo(() => getTheme(cardVariant), [cardVariant]);

  const gameResult = useMemo(() => {
    if (!isGameOver) return null;
    if (isWinner || snapshot?.winnerId === currentUserId) return 'victory';
    return 'defeat';
  }, [isGameOver, isWinner, snapshot?.winnerId, currentUserId]);

  if (!room) return null;

  return (
    <GameLayout
      gameContainerRef={containerRef}
      variant={cardVariant}
      isMyTurn={!!isMyTurn}
      popupOverlay={
        latestMessage ? (
          <ChatMessagePopup
            key={latestMessage.id}
            senderName={latestMessage.senderName}
            message={latestMessage.message}
            visible={!!latestMessage}
            onDismiss={dismissPopup}
          />
        ) : undefined
      }
      lobby={
        !snapshot ? (
          <SeaBattleLobby
            room={room!}
            isHost={isHost}
            startBusy={!!startBusy}
            onStartGame={handleStartGame}
            onReorderPlayers={handleReorderPlayers}
            onShowRules={setShowRules}
            onDeleteRoom={() => storeDeleteRoom(roomId)}
            onRefresh={() => storeRefreshRoom(roomId)}
            t={t}
          />
        ) : undefined
      }
      header={
        <CompactHeaderContainer>
          <HeaderTitleArea>
            <RoomTitle>
              {t('games.sea_battle_v1.name' as TranslationKey)} {variantLabel} -{' '}
              {room?.name}
            </RoomTitle>
          </HeaderTitleArea>

          <TurnIndicator $isYourTurn={!!isMyTurn} $theme={theme}>
            {getTurnStatusText()}
          </TurnIndicator>

          <ActionSection>
            <FullscreenButton
              onClick={() => setShowRules(true)}
              title="Game Rules"
            >
              📖
            </FullscreenButton>
            {snapshot && (
              <ChatToggleButton onClick={handleToggleChat}>
                {showChat
                  ? t('games.sea_battle_v1.table.chat.hide' as TranslationKey)
                  : t('games.sea_battle_v1.table.chat.show' as TranslationKey)}
              </ChatToggleButton>
            )}
          </ActionSection>
        </CompactHeaderContainer>
      }
      showChat={showChat}
      chat={
        snapshot ? (
          <GameChat
            resolveDisplayName={resolveDisplayName}
            onClose={handleToggleChat}
          />
        ) : undefined
      }
      modals={
        <>
          <RulesModal
            isOpen={showRules}
            onClose={() => setShowRules(false)}
            t={t}
          />
          <GameResultModal
            isOpen={isGameOver && !resultModalDismissed}
            result={gameResult}
            onRematch={isHost ? handleOpenRematch : undefined}
            onClose={() => setResultModalDismissed(true)}
            rematchLoading={rematchLoading}
            t={t}
          />

          <RematchModal
            isOpen={showRematchModal}
            players={
              snapshot?.players.map((p) => ({
                playerId: p.playerId,
                displayName: resolveDisplayName(
                  p.playerId,
                  `Player ${p.playerId.slice(0, 4)} `,
                ),
                alive: p.alive,
              })) || []
            }
            currentUserId={currentUserId}
            rematchLoading={rematchLoading}
            onClose={closeRematchModal}
            onConfirm={handleRematch}
            t={t}
            cardVariant={cardVariant}
          />

          <RematchInvitationModal
            isOpen={!!invitation}
            senderName={invitation?.hostName || ''}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            t={t}
          />
        </>
      }
    >
      {snapshot && isPlacementPhase && (
        <ShipPlacementBoard
          key="placement-board"
          currentPlayer={currentPlayer}
          onPlaceShip={placeShip}
          onConfirmPlacement={confirmPlacement}
          onResetPlacement={resetPlacement}
          isPlacementComplete={isPlacementComplete}
          onAutoPlace={handleAutoPlace}
          variant={cardVariant}
        />
      )}

      {snapshot && isBattlePhase && (
        <AttackBoard
          key="attack-board"
          players={snapshot.players}
          currentUserId={currentUserId}
          currentTurnPlayerId={snapshot.playerOrder[snapshot.currentTurnIndex]}
          isMyTurn={isMyTurn}
          onAttack={attack}
          resolveDisplayName={resolveDisplayName}
          variant={cardVariant}
        />
      )}
    </GameLayout>
  );
}
