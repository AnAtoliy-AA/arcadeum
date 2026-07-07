'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
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
import type { ChessGameProps } from '../types';
import { FILES, type BoardPosition, type File, type PieceType } from '../types';
import { useChessState } from '../hooks/useChessState';
import { useChessActions } from '../hooks/useChessActions';
import { ChessLobby } from './ChessLobby';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { PromotionModal } from './PromotionModal';
import { RulesModal } from './RulesModal';

function ChessGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  showRulesOpen,
  onShowRulesClose,
}: ChessGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

  const isLobby = room?.status === 'lobby';

  const {
    snapshot,
    myColor,
    myTurn,
    isGameOver,
    startBusy,
    setStartBusy,
    session,
  } = useChessState({
    roomId,
    currentUserId,
    initialSession,
  });

  const { startSession, movePiece, resign } = useChessActions({
    roomId,
    userId: currentUserId,
  });

  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);

  const resolveDisplayNameBound = useCallback(
    (id?: string | null) =>
      resolveDisplayName(id, {
        currentUserId,
        members: room?.members,
        playerOrder: snapshot?.players.map((p) => p.playerId),
      }),
    [currentUserId, room, snapshot],
  );

  const sendChat = useGameChatSend(roomId, currentUserId, 'chess_v1');
  useGameChatIntegration(
    snapshot?.logs as never,
    sendChat,
    resolveDisplayNameBound,
  );

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.players.find((p) => p.color === snapshot.winnerColor)
      ?.playerId,
    isDraw:
      snapshot?.isStalemate ||
      snapshot?.isDrawByRepetition ||
      snapshot?.isDrawByFiftyMoveRule ||
      snapshot?.isInsufficientMaterial,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  useRecordGameResult(result, 'chess_v1', session?.id);

  const { showResultModal, sharedResult, resultMessages, dismiss } =
    useGameResultModal(
      session,
      result,
      result
        ? {
            title: t(
              `games.chess_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
            message: t(
              `games.chess_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
          }
        : undefined,
    );

  const isFlipped = myColor === 'black';

  const lastMove = useMemo(() => {
    if (!snapshot?.moveHistory.length) return null;
    const last = snapshot.moveHistory[snapshot.moveHistory.length - 1];
    return { from: last.from, to: last.to };
  }, [snapshot?.moveHistory]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare || !snapshot) return [];
    const moves: BoardPosition[] = [];
    for (const m of snapshot.moveHistory) {
      if (
        m.from.file === selectedSquare.file &&
        m.from.rank === selectedSquare.rank
      ) {
        moves.push(m.to);
      }
    }
    return moves;
  }, [selectedSquare, snapshot]);

  const kingPosition = (() => {
    if (!snapshot) return null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = snapshot.board[row]?.[col];
        if (
          piece?.type === 'king' &&
          piece.color === snapshot.currentTurnColor
        ) {
          return {
            file: FILES[col],
            rank: (8 - row) as import('../types').Rank,
          };
        }
      }
    }
    return null;
  })();

  const handleSquareClick = useCallback(
    (file: File, rank: import('../types').Rank) => {
      if (!snapshot || !myColor || isGameOver) return;

      const piece = snapshot.board[8 - rank]?.[FILES.indexOf(file)];

      if (selectedSquare) {
        const isLegalTarget = legalMoves.some(
          (m) => m.file === file && m.rank === rank,
        );

        if (isLegalTarget) {
          const isPromotion =
            piece === null &&
            selectedSquare.rank === (myColor === 'white' ? 7 : 2) &&
            snapshot.board[8 - selectedSquare.rank]?.[
              FILES.indexOf(selectedSquare.file)
            ]?.type === 'pawn';

          if (isPromotion) {
            setPendingPromotion({
              from: selectedSquare,
              to: { file, rank },
            });
          } else {
            movePiece(selectedSquare.file, selectedSquare.rank, file, rank);
          }
          setSelectedSquare(null);
          return;
        }

        if (piece?.color === myColor) {
          setSelectedSquare({ file, rank });
          return;
        }

        setSelectedSquare(null);
        return;
      }

      if (piece?.color === myColor) {
        setSelectedSquare({ file, rank });
      }
    },
    [snapshot, myColor, selectedSquare, legalMoves, isGameOver, movePiece],
  );

  const handlePromotionSelect = useCallback(
    (pieceType: PieceType) => {
      if (!pendingPromotion) return;
      movePiece(
        pendingPromotion.from.file,
        pendingPromotion.from.rank,
        pendingPromotion.to.file,
        pendingPromotion.to.rank,
        pieceType,
      );
      setPendingPromotion(null);
    },
    [pendingPromotion, movePiece],
  );

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  if (!room) return null;

  if (isLobby) {
    return (
      <ChessLobby
        room={room}
        userId={currentUserId ?? ''}
        isHost={isHost}
        startBusy={startBusy}
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
    );
  }

  const board = (
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
      {snapshot ? (
        <>
          <ChessClock
            clocks={snapshot.clocks}
            currentTurnColor={snapshot.currentTurnColor}
            isGameOver={isGameOver}
          />
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="600" opacity={0.8}>
              {snapshot.currentTurnColor === 'white' ? '♔ White' : '♚ Black'} to
              move
              {snapshot.isCheck && !snapshot.isCheckmate ? ' (check!)' : ''}
            </Text>
            <Text fontSize="$2" opacity={0.6}>
              {snapshot.fullMoveNumber}.
            </Text>
          </XStack>
          <ChessBoard
            board={snapshot.board}
            myColor={myColor}
            isFlipped={isFlipped}
            disabled={!myTurn || isGameOver}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isCheck={snapshot.isCheck}
            kingPosition={kingPosition}
            ariaLabel={`Chess board, ${snapshot.currentTurnColor} to move`}
            onSquareClick={handleSquareClick}
          />
          <XStack justifyContent="space-between" alignItems="center" mt="$1">
            <Text
              fontSize="$2"
              opacity={0.6}
              cursor="pointer"
              hoverStyle={{ opacity: 1 }}
              onPress={resign}
            >
              Resign
            </Text>
            {snapshot.moveHistory.length > 0 && (
              <Text fontSize="$2" opacity={0.5}>
                {snapshot.moveHistory.length} moves
              </Text>
            )}
          </XStack>
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
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
      <PromotionModal
        isOpen={!!pendingPromotion}
        color={myColor ?? 'white'}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />
    </>
  );

  return (
    <GameWidgetContainer
      board={board}
      modals={modals}
      isMyTurn={myTurn}
      isGameOver={isGameOver}
      loading={!snapshot}
      headerProps={{
        variantEmoji: '♟',
        title: 'Chess',
        subtitle: room?.name,
        turn: {
          onClockUserId:
            snapshot?.players.find((p) => p.color === snapshot.currentTurnColor)
              ?.playerId ?? null,
          isMyTurn: myTurn,
          isGameOver,
        },
      }}
    />
  );
}

export default memo(ChessGameImpl);
