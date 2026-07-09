'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { MoveList } from './MoveList';
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
import type { ChessGameProps, ChessClientState } from '../types';
import {
  FILES,
  type BoardPosition,
  type Board,
  type File,
  type PieceType,
} from '../types';
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

  const { startSession, movePiece, resign, offerDraw, acceptDraw } =
    useChessActions({
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

  const [optimisticState, setOptimisticState] =
    useState<ChessClientState | null>(null);

  const displaySnapshot =
    optimisticState &&
    snapshot &&
    optimisticState.moveHistory.length >= snapshot.moveHistory.length
      ? optimisticState
      : snapshot;

  const displayMyTurn = !!(
    displaySnapshot &&
    currentUserId &&
    displaySnapshot.players.find(
      (p) =>
        p.playerId === currentUserId &&
        p.color === displaySnapshot.currentTurnColor,
    )
  );

  const applyOptimisticMove = useCallback(
    (
      fromFile: File,
      fromRank: import('../types').Rank,
      toFile: File,
      toRank: import('../types').Rank,
      promotion?: PieceType,
    ) => {
      if (!snapshot) return;
      const fromRow = 8 - fromRank;
      const fromCol = FILES.indexOf(fromFile);
      const toRow = 8 - toRank;
      const toCol = FILES.indexOf(toFile);
      const piece = snapshot.board[fromRow]?.[fromCol];
      if (!piece) return;

      const newBoard: Board = snapshot.board.map((row) => [...row]);
      newBoard[toRow][toCol] = promotion
        ? { type: promotion, color: piece.color }
        : piece;
      newBoard[fromRow][fromCol] = null;

      setOptimisticState({
        ...snapshot,
        board: newBoard,
        currentTurnColor:
          snapshot.currentTurnColor === 'white' ? 'black' : 'white',
        moveHistory: [
          ...snapshot.moveHistory,
          {
            from: { file: fromFile, rank: fromRank },
            to: { file: toFile, rank: toRank },
            piece,
            captured: snapshot.board[toRow]?.[toCol] ?? null,
            promotion: promotion ?? null,
            isCastle: false,
            isEnPassant: false,
            notation: '',
          },
        ],
        legalMovesForCurrentPlayer: [],
        isCheck: false,
      });
    },
    [snapshot],
  );

  const resolveDisplayNameBound = useCallback(
    (id?: string | null) =>
      resolveDisplayName(id, {
        currentUserId,
        members: room?.members,
        playerOrder: displaySnapshot?.players.map((p) => p.playerId),
      }),
    [currentUserId, room, displaySnapshot],
  );

  const sendChat = useGameChatSend(roomId, currentUserId, 'chess_v1');
  useGameChatIntegration(
    snapshot?.logs as never,
    sendChat,
    resolveDisplayNameBound,
  );

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: displaySnapshot?.players.find(
      (p) => p.color === displaySnapshot.winnerColor,
    )?.playerId,
    isDraw:
      displaySnapshot?.isStalemate ||
      displaySnapshot?.isDrawByRepetition ||
      displaySnapshot?.isDrawByFiftyMoveRule ||
      displaySnapshot?.isInsufficientMaterial,
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
    if (!displaySnapshot?.moveHistory.length) return null;
    const last =
      displaySnapshot.moveHistory[displaySnapshot.moveHistory.length - 1];
    return { from: last.from, to: last.to };
  }, [displaySnapshot?.moveHistory]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare || !displaySnapshot) return [];
    const moves: BoardPosition[] = [];
    for (const m of displaySnapshot.legalMovesForCurrentPlayer ?? []) {
      if (
        m.from.file === selectedSquare.file &&
        m.from.rank === selectedSquare.rank
      ) {
        moves.push(m.to);
      }
    }
    return moves;
  }, [selectedSquare, displaySnapshot]);

  const kingPosition = (() => {
    if (!displaySnapshot) return null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = displaySnapshot.board[row]?.[col];
        if (
          piece?.type === 'king' &&
          piece.color === displaySnapshot.currentTurnColor
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
      if (!displaySnapshot || !myColor || isGameOver) return;

      const piece = displaySnapshot.board[8 - rank]?.[FILES.indexOf(file)];

      if (selectedSquare) {
        const isLegalTarget = legalMoves.some(
          (m) => m.file === file && m.rank === rank,
        );

        if (isLegalTarget) {
          const isPromotion =
            piece === null &&
            selectedSquare.rank === (myColor === 'white' ? 7 : 2) &&
            displaySnapshot.board[8 - selectedSquare.rank]?.[
              FILES.indexOf(selectedSquare.file)
            ]?.type === 'pawn';

          if (isPromotion) {
            setPendingPromotion({
              from: selectedSquare,
              to: { file, rank },
            });
          } else {
            applyOptimisticMove(
              selectedSquare.file,
              selectedSquare.rank,
              file,
              rank,
            );
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
    [
      displaySnapshot,
      myColor,
      selectedSquare,
      legalMoves,
      isGameOver,
      movePiece,
      applyOptimisticMove,
    ],
  );

  const handlePromotionSelect = useCallback(
    (pieceType: PieceType) => {
      if (!pendingPromotion) return;
      applyOptimisticMove(
        pendingPromotion.from.file,
        pendingPromotion.from.rank,
        pendingPromotion.to.file,
        pendingPromotion.to.rank,
        pieceType,
      );
      movePiece(
        pendingPromotion.from.file,
        pendingPromotion.from.rank,
        pendingPromotion.to.file,
        pendingPromotion.to.rank,
        pieceType,
      );
      setPendingPromotion(null);
    },
    [pendingPromotion, movePiece, applyOptimisticMove],
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
      {displaySnapshot ? (
        <>
          <ChessClock
            clocks={displaySnapshot.clocks}
            currentTurnColor={displaySnapshot.currentTurnColor}
            isGameOver={isGameOver}
          />
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="600" opacity={0.8}>
              {displaySnapshot.currentTurnColor === 'white'
                ? '♔ White'
                : '♚ Black'}{' '}
              to move
              {displaySnapshot.isCheck && !displaySnapshot.isCheckmate
                ? ' (check!)'
                : ''}
            </Text>
            <Text fontSize="$2" opacity={0.6}>
              {displaySnapshot.fullMoveNumber}.
            </Text>
          </XStack>
          <ChessBoard
            board={displaySnapshot.board}
            myColor={myColor}
            isFlipped={isFlipped}
            disabled={!displayMyTurn || isGameOver}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            isCheck={displaySnapshot.isCheck}
            kingPosition={kingPosition}
            ariaLabel={`Chess board, ${displaySnapshot.currentTurnColor} to move`}
            onSquareClick={handleSquareClick}
          />
          <XStack justifyContent="space-between" alignItems="center" mt="$1">
            {currentUserId && !isGameOver && (
              <>
                {displaySnapshot?.drawOfferedBy &&
                displaySnapshot.drawOfferedBy !== currentUserId ? (
                  <XStack gap="$2" alignItems="center">
                    <Text
                      fontSize="$2"
                      color="$green10"
                      cursor="pointer"
                      hoverStyle={{ opacity: 0.8 }}
                      onPress={acceptDraw}
                    >
                      Accept Draw
                    </Text>
                    <Text
                      fontSize="$2"
                      opacity={0.6}
                      cursor="pointer"
                      hoverStyle={{ opacity: 1 }}
                      onPress={resign}
                    >
                      Decline
                    </Text>
                  </XStack>
                ) : (
                  <XStack gap="$3" alignItems="center">
                    <Text
                      fontSize="$2"
                      opacity={0.6}
                      cursor="pointer"
                      hoverStyle={{ opacity: 1 }}
                      onPress={offerDraw}
                      disabled={!!displaySnapshot?.drawOfferedBy}
                    >
                      {displaySnapshot?.drawOfferedBy ? 'Draw Offered' : 'Draw'}
                    </Text>
                    <Text
                      fontSize="$2"
                      opacity={0.6}
                      cursor="pointer"
                      hoverStyle={{ opacity: 1 }}
                      onPress={resign}
                    >
                      Resign
                    </Text>
                  </XStack>
                )}
              </>
            )}
            {displaySnapshot && displaySnapshot.moveHistory.length > 0 && (
              <Text fontSize="$2" opacity={0.5}>
                {displaySnapshot.moveHistory.length} moves
              </Text>
            )}
          </XStack>
          {displaySnapshot && displaySnapshot.moveHistory.length > 0 && (
            <MoveList state={displaySnapshot} t={t} />
          )}
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
      isMyTurn={displayMyTurn}
      isGameOver={isGameOver}
      loading={!snapshot}
      headerProps={{
        variantEmoji: '♟',
        title: 'Chess',
        subtitle: room?.name,
        turn: {
          onClockUserId:
            displaySnapshot?.players.find(
              (p) => p.color === displaySnapshot.currentTurnColor,
            )?.playerId ?? null,
          isMyTurn: myTurn,
          isGameOver,
        },
      }}
    />
  );
}

export default memo(ChessGameImpl);
