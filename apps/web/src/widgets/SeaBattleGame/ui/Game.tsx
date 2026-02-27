'use client';

import React, { useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { SeaBattleGameProps } from '../types';
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
import { ChatSection } from '@/widgets/CriticalGame/ui/ChatSection';
import { ChatScope } from '@/shared/types/games';
import { GameLayout } from '@/features/games/ui/GameLayout';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { getTheme } from '../lib/theme';

import { RulesModal } from './RulesModal';
import { FullscreenButton } from '@/widgets/CriticalGame/ui/styles';
import { TurnIndicator } from './styles';

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

const ContentHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
  }
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px; /* Space for scrollbar if visible */
    &::-webkit-scrollbar {
      display: none;
    }
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

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Chat State
  const [showChat, setShowChat] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatScope, setChatScope] = useState<ChatScope>('all');
  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);

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
    // Just trigger the backend action
    autoPlace();
  }, [autoPlace]);

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const handleSendChatMessage = useCallback(() => {
    if (!chatMessage.trim() || !currentUserId || !postHistoryNoteAction) return;
    postHistoryNoteAction(chatMessage, chatScope);
    setChatMessage('');
  }, [chatMessage, chatScope, currentUserId, postHistoryNoteAction]);

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

  // Rematch Logic
  const {
    rematchLoading,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
    invitation,
    handleAcceptInvitation,
    handleDeclineInvitation,
    invitationTimeLeft,
    handleBlockRematch,
    handleBlockUser,
    isAcceptingInvitation,
  } = useRematch({
    roomId,
    gameOptions: room?.gameOptions,
  });

  // Auto-open modal on game over
  React.useEffect(() => {
    if (isGameOver && isHost) {
      // Host logic if needed
    }
    if (isGameOver) {
      setShowResultModal(true);
    }
  }, [isGameOver, isHost]);

  const { isWinner } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room: room!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshot: snapshot as any, // Cast to any because types differ slightly but we only need player list
    youLabel: t('games.sea_battle_v1.table.players.you'),
    translateCardType: () => '',
    seeTheFutureLabel: '',
  });

  const cardVariant = (room?.gameOptions?.variant ||
    room?.gameOptions?.cardVariant) as string | undefined;

  // Compute turn status text
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
  const theme = React.useMemo(() => getTheme(cardVariant), [cardVariant]);

  const gameResult = React.useMemo(() => {
    if (!isGameOver) return null;
    if (isWinner || snapshot?.winnerId === currentUserId) return 'victory';
    return 'defeat';
  }, [isGameOver, isWinner, snapshot?.winnerId, currentUserId]);

  if (!room) return null;

  return (
    <GameLayout
      gameContainerRef={containerRef as React.RefObject<HTMLDivElement>}
      variant={cardVariant}
      isMyTurn={!!isMyTurn}
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
            t={t}
          />
        ) : undefined
      }
      header={
        <TurnIndicator $isYourTurn={!!isMyTurn} $theme={theme}>
          {getTurnStatusText()}
        </TurnIndicator>
      }
      showChat={showChat}
      chat={
        snapshot ? (
          <ChatSection
            logs={snapshot.logs ?? []}
            chatMessagesRef={chatMessagesRef}
            chatMessage={chatMessage}
            onChatMessageChange={setChatMessage}
            chatScope={chatScope}
            onChatScopeChange={setChatScope}
            onSendMessage={handleSendChatMessage}
            currentUserId={currentUserId}
            turnStatus={
              isMyTurn
                ? t('games.sea_battle_v1.table.players.yourTurn')
                : 'Standard'
            }
            resolveDisplayName={resolveDisplayName}
            formatLogMessage={formatLogMessage}
            t={t}
            cardVariant={cardVariant}
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
            isOpen={showResultModal && !!(isGameOver || snapshot?.winnerId)}
            result={gameResult}
            onRematch={isHost ? openRematchModal : undefined}
            onClose={() => setShowResultModal(false)}
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
            hostName={invitation?.hostName || ''}
            hostId={invitation?.hostId}
            roomId={invitation?.newRoomId}
            message={invitation?.message}
            timeLeft={invitationTimeLeft}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            onBlockRematch={handleBlockRematch}
            onBlockUser={handleBlockUser}
            accepting={isAcceptingInvitation}
            t={t}
            cardVariant={cardVariant}
          />
        </>
      }
    >
      <ContentHeader>
        <HeaderTopRow>
          <RoomTitle>
            {t('games.sea_battle_v1.name' as TranslationKey)} {variantLabel} -{' '}
            {room?.name}
          </RoomTitle>
          <ActionSection>
            <FullscreenButton
              onClick={() => setShowRules(true)}
              title="Game Rules"
              style={{ fontSize: '1.2rem' }}
            >
              📖
            </FullscreenButton>
            {snapshot && (
              <button
                onClick={handleToggleChat}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {showChat
                  ? t('games.sea_battle_v1.table.chat.hide' as TranslationKey)
                  : t('games.sea_battle_v1.table.chat.show' as TranslationKey)}
              </button>
            )}
          </ActionSection>
        </HeaderTopRow>
      </ContentHeader>

      {snapshot && isPlacementPhase && (
        <ShipPlacementBoard
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
