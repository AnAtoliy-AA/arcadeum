'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { YStack } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import {
  useGameChatIntegration,
  useGameChatSend,
  useRematch,
  useGameRoomActions,
  useGameResultModal,
} from '@/features/games/hooks';
import { computeGameResult } from '@/features/games/lib/computeGameResult';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useRecordGameResult } from '@/features/stats/hooks/useRecordGameResult';
import { useTranslation } from '@/shared/lib/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { CheckersGameProps, MoveStep } from '../types';
import { useCheckersState } from '../hooks/useCheckersState';
import { useCheckersActions } from '../hooks/useCheckersActions';
import { CheckersThemeProvider } from '../lib/CheckersThemeContext';
import { CheckersLobby } from './CheckersLobby';
import { CheckersBoard } from './CheckersBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { CHECKERS_VARIANTS } from '../lib/constants';

function CheckersGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: CheckersGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

  const isLobby = room?.status === 'lobby';

  const {
    snapshot,
    currentTurnUserId,
    myTurn,
    isGameOver,
    startBusy,
    setStartBusy,
    session,
  } = useCheckersState({
    roomId,
    currentUserId,
    initialSession,
  });

  const { startSession, movePiece } = useCheckersActions({
    roomId,
    userId: currentUserId,
  });

  const resolveDisplayNameBound = useCallback(
    (id?: string | null) =>
      resolveDisplayName(id, {
        currentUserId,
        members: room?.members,
        playerOrder: snapshot?.playerOrder,
      }),
    [currentUserId, room, snapshot],
  );

  const sendChat = useGameChatSend(roomId, currentUserId, 'checkers_v1');
  useGameChatIntegration(
    snapshot?.logs as never,
    sendChat,
    resolveDisplayNameBound,
  );

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
  );

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.winnerId,
    isDraw: snapshot?.isDraw,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  useRecordGameResult(result, 'checkers_v1', session?.id);

  const { showResultModal, sharedResult, resultMessages, dismiss } =
    useGameResultModal(
      session,
      result,
      result
        ? {
            title: t(
              `games.checkers_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
            message: t(
              `games.checkers_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
          }
        : undefined,
      isGameOver,
    );

  const variant = useMemo(
    () => (room?.gameOptions as Record<string, string>)?.variant ?? 'classic',
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      CHECKERS_VARIANTS.find((v) => v.id === variant) ??
      CHECKERS_VARIANTS[0],
    [variant],
  );

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [pendingSteps, setPendingSteps] = useState<MoveStep[]>([]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!snapshot || !currentUserId || isGameOver || !myTurn) return;

      const piece = snapshot.board[row][col];

      // If clicking own piece, select it
      if (piece && piece.playerId === currentUserId) {
        setSelectedPiece({ row, col });
        setPendingSteps([]);
        return;
      }

      // If a piece is selected and clicking empty, try to move
      if (selectedPiece) {
        const moveStep: MoveStep = {
          fromRow: selectedPiece.row,
          fromCol: selectedPiece.col,
          toRow: row,
          toCol: col,
        };

        // Check if this is a capture (piece between)
        const midRow = (selectedPiece.row + row) / 2;
        const midCol = (selectedPiece.col + col) / 2;
        const isCapture = Math.abs(row - selectedPiece.row) === 2;

        if (isCapture) {
          moveStep.capturedRow = midRow;
          moveStep.capturedCol = midCol;
        }

        const newSteps = [...pendingSteps, moveStep];

        // If it's a capture chain, check if more captures are available from the destination
        if (isCapture) {
          // For simplicity, send the chain immediately
          movePiece(newSteps);
          setSelectedPiece(null);
          setPendingSteps([]);
        } else {
          movePiece(newSteps);
          setSelectedPiece(null);
          setPendingSteps([]);
        }
      }
    },
    [snapshot, currentUserId, isGameOver, myTurn, selectedPiece, pendingSteps, movePiece],
  );

  if (!room) return null;

  if (isLobby) {
    return (
      <CheckersThemeProvider variant={variant}>
        <CheckersLobby
          room={room}
          userId={currentUserId ?? ''}
          isHost={isHost}
          startBusy={startBusy}
          onReorderPlayers={handleReorderPlayers}
          onStartGame={(opts) => {
            setStartBusy(true);
            startSession({
              withBots: !!opts?.withBots,
              botCount: opts?.botCount,
            });
          }}
          onLeaveRoom={() => onLeaveRoom(currentUserId ?? '')}
          onDeleteRoom={onDeleteRoom}
          onKickPlayer={(userId) => onKickPlayer(userId, currentUserId ?? '')}
          onRefresh={onRefresh}
          showRulesOpen={showRulesOpen}
          onShowRulesClose={onShowRulesClose}
        />
      </CheckersThemeProvider>
    );
  }

  const board = (
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
      {snapshot ? (
        <>
          <TurnBadge
            currentTurnUserId={currentTurnUserId}
            players={snapshot.players}
            myTurn={myTurn}
            resolveName={resolveDisplayNameBound}
          />
          <CheckersBoard
            board={snapshot.board}
            players={snapshot.players}
            selectedPiece={selectedPiece}
            disabled={!myTurn || isGameOver}
            ariaLabel="Checkers 8×8 board"
            onCellClick={handleCellClick}
          />
        </>
      ) : null}
    </YStack>
  );

  const modals = (
    <>
      <GameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={dismiss}
        onRematch={result ? onRematchClick : undefined}
        rematchLoading={rematchLoading}
        t={t}
        messages={resultMessages}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
      />
    </>
  );

  return (
    <CheckersThemeProvider variant={variant}>
      <GameWidgetContainer
        board={board}
        modals={modals}
        variant={variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        loading={!snapshot}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Checkers',
          subtitle: room?.name,
          turn: {
            onClockUserId: currentTurnUserId,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </CheckersThemeProvider>
  );
}

export default memo(CheckersGameImpl);
