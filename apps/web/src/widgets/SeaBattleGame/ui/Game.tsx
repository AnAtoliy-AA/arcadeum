'use client';

import React, { useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { SeaBattleGameProps } from '../types';
import { MIN_PLAYERS } from '../types';
import { useSeaBattleState } from '../hooks/useSeaBattleState';
import { useSeaBattleActions } from '../hooks/useSeaBattleActions';
import { useGameRoom } from '../hooks/useGameRoom';
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

const Header = styled.div`
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px 12px 0 0;
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
  const room = useGameRoom(initialRoom);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Chat State
  const [showChat, setShowChat] = useState(true);
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
    room,
  });

  const handleStartGame = useCallback(
    (options?: { withBots?: boolean; botCount?: number }) => {
      const memberCount = room.members?.length || 0;
      if (
        memberCount >= MIN_PLAYERS ||
        (options?.withBots && memberCount >= 1)
      ) {
        startSession(options);
      }
    },
    [room.members, startSession],
  );

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch (error) {
        console.error('Failed to reorder participants:', error);
      }
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
    gameOptions: room.gameOptions,
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
    room,
  });

  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshot: snapshot as any, // Cast to any because types differ slightly but we only need player list
    youLabel: 'You',
    translateCardType: () => '',
    seeTheFutureLabel: '',
  });

  const cardVariant = (room.gameOptions?.variant ||
    room.gameOptions?.cardVariant) as string | undefined;

  // Compute turn status text
  const getTurnStatusText = () => {
    if (!snapshot) return '';
    if (isGameOver) return 'Game Over';
    if (isPlacementPhase) {
      return isPlacementComplete ? 'Waiting for others...' : 'Place your ships';
    }
    if (!currentTurnPlayer) return '';
    if (currentTurnPlayer.playerId === currentUserId) {
      return '🎯 Your Turn!';
    }
    return `Waiting for ${resolveDisplayName(currentTurnPlayer.playerId, 'opponent')}`;
  };

  const currentVariant = SEA_BATTLE_VARIANTS.find((v) => v.id === cardVariant);
  const variantLabel = currentVariant ? `(${currentVariant.name})` : '';

  const gameResult = React.useMemo(() => {
    if (!isGameOver) return null;
    if (isWinner || snapshot?.winnerId === currentUserId) return 'victory';
    return 'defeat';
  }, [isGameOver, isWinner, snapshot?.winnerId, currentUserId]);

  return (
    <GameLayout
      gameContainerRef={containerRef as React.RefObject<HTMLDivElement>}
      variant={cardVariant}
      isMyTurn={!!isMyTurn}
      lobby={
        !snapshot ? (
          <SeaBattleLobby
            room={room}
            isHost={isHost}
            startBusy={!!startBusy}
            onStartGame={handleStartGame}
            onReorderPlayers={handleReorderPlayers}
            t={t}
          />
        ) : undefined
      }
      header={
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2>
              Sea Battle {variantLabel} - {room.name}
            </h2>
            <div
              style={{
                padding: '4px 12px',
                background: isMyTurn
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {getTurnStatusText()}
            </div>
          </div>
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
              {showChat ? 'Hide Chat' : 'Chat'}
            </button>
          )}
        </Header>
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
            turnStatus={isMyTurn ? 'Your Turn' : 'Standard'}
            resolveDisplayName={resolveDisplayName}
            formatLogMessage={formatLogMessage}
            t={t}
            cardVariant={cardVariant}
            onClose={handleToggleChat}
          />
        ) : undefined
      }
    >
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
              `Player ${p.playerId.slice(0, 4)}`,
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
    </GameLayout>
  );
}
