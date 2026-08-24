'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  GameWidgetContainer,
  RematchInvitationModal,
} from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useRematch,
  useGameRoomActions,
  useGameResultModal,
  useGameResult,
} from '@/features/games/hooks';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useTranslation } from '@/shared/lib/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { ChessGameProps, ChessClientState } from '../types';
import { FILES, type BoardPosition, type File, type PieceType } from '../types';
import { useChessState } from '../hooks/useChessState';
import { useChessActions } from '../hooks/useChessActions';
import { useChessCoach } from '../hooks/useChessCoach';
import { calculateOptimisticChessState } from '../lib/optimisticMove';
import { getChessA11yAnnouncement } from '../lib/a11yAnnouncement';
import { ChessLobby } from './ChessLobby';
import { ChessBoardPanel } from './ChessBoardPanel';
import { ChessGameResultModal } from './ChessGameResultModal';
import { PromotionModal } from './PromotionModal';
import { RulesModal } from './RulesModal';
import { ChessThemeProvider } from '../lib/ChessThemeContext';

function ChessGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
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
    isSpectator,
    isGameOver,
    startBusy,
    setStartBusy,
    session,
  } = useChessState({ roomId, currentUserId, initialSession });
  const { startSession, movePiece, resign, offerDraw, acceptDraw } =
    useChessActions({ roomId, userId: currentUserId });
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);
  const [optimisticState, setOptimisticState] =
    useState<ChessClientState | null>(null);

  // Clear stale optimistic state when server catches up
  useEffect(() => {
    if (
      optimisticState &&
      snapshot &&
      snapshot.moveHistory.length >= optimisticState.moveHistory.length
    ) {
      queueMicrotask(() => setOptimisticState(null));
    }
  }, [snapshot, optimisticState]);

  const displaySnapshot =
    optimisticState &&
    snapshot &&
    optimisticState.moveHistory.length > snapshot.moveHistory.length
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

  const coach = useChessCoach({ room, currentUserId, displaySnapshot });
  const applyOptimisticMove = useCallback(
    (
      fromFile: File,
      fromRank: import('../types').Rank,
      toFile: File,
      toRank: import('../types').Rank,
      promotion?: PieceType,
    ) => {
      if (!snapshot) return;
      const next = calculateOptimisticChessState(
        snapshot,
        fromFile,
        fromRank,
        toFile,
        toRank,
        promotion,
      );
      if (next) {
        setOptimisticState(next);
      }
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
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);
  const {
    rematchLoading,
    handleRematch,
    invitation,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useRematch({ roomId });
  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
  );
  const winnerId =
    displaySnapshot?.players.find(
      (p) => p.color === displaySnapshot.winnerColor,
    )?.playerId ?? null;
  const isDraw = !!(
    displaySnapshot?.isStalemate ||
    displaySnapshot?.isDrawByRepetition ||
    displaySnapshot?.isDrawByFiftyMoveRule ||
    displaySnapshot?.isInsufficientMaterial ||
    displaySnapshot?.isDrawByAgreement
  );
  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'chess_v1',
    gameOverKey: 'games.chess_v1.gameOver',
    winnerId,
    isDraw,
    t,
  });
  const { showResultModal, sharedResult, dismiss } = useGameResultModal(
    session,
    result,
    resultMessages,
    isGameOver,
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
    return (displaySnapshot.legalMovesForCurrentPlayer ?? [])
      .filter(
        (m) =>
          m.from.file === selectedSquare.file &&
          m.from.rank === selectedSquare.rank,
      )
      .map((m) => m.to);
  }, [selectedSquare, displaySnapshot]);
  const kingPosition = (() => {
    if (!displaySnapshot) return null;
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 8; col++) {
        const p = displaySnapshot.board[row]?.[col];
        if (p?.type === 'king' && p.color === displaySnapshot.currentTurnColor)
          return {
            file: FILES[col],
            rank: (8 - row) as import('../types').Rank,
          };
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
          if (isPromotion)
            setPendingPromotion({ from: selectedSquare, to: { file, rank } });
          else {
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
      if (piece?.color === myColor) setSelectedSquare({ file, rank });
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

  const handlePieceDrop = useCallback(
    (
      fromFile: File,
      fromRank: import('../types').Rank,
      toFile: File,
      toRank: import('../types').Rank,
    ) => {
      if (!displayMyTurn || isGameOver || !myColor || !displaySnapshot) return;
      const piece =
        displaySnapshot.board[8 - fromRank]?.[FILES.indexOf(fromFile)];
      if (!piece || piece.color !== myColor) return;
      const moves = (displaySnapshot.legalMovesForCurrentPlayer ?? []).filter(
        (m) =>
          m.from.file === fromFile &&
          m.from.rank === fromRank &&
          m.to.file === toFile &&
          m.to.rank === toRank,
      );
      if (!moves.length) return;
      if (moves[0].promotion)
        setPendingPromotion({
          from: { file: fromFile, rank: fromRank },
          to: { file: toFile, rank: toRank },
        });
      else {
        applyOptimisticMove(fromFile, fromRank, toFile, toRank);
        movePiece(fromFile, fromRank, toFile, toRank);
      }
    },
    [
      displaySnapshot,
      displayMyTurn,
      isGameOver,
      myColor,
      applyOptimisticMove,
      movePiece,
    ],
  );

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  const a11yAnnouncement = useMemo(
    () =>
      getChessA11yAnnouncement(
        displaySnapshot,
        isGameOver,
        currentUserId,
        resolveDisplayNameBound,
        t,
      ),
    [displaySnapshot, isGameOver, currentUserId, resolveDisplayNameBound, t],
  );

  if (!room) return null;
  if (isLobby)
    return (
      <ChessLobby
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
            botDifficulty: opts?.botDifficulty,
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

  const board = (
    <ChessBoardPanel
      snapshot={displaySnapshot}
      myColor={myColor}
      isFlipped={isFlipped}
      displayMyTurn={displayMyTurn}
      isGameOver={isGameOver}
      isSpectator={isSpectator}
      selectedSquare={selectedSquare}
      legalMoves={legalMoves}
      lastMove={lastMove}
      kingPosition={kingPosition}
      coach={coach}
      currentUserId={currentUserId}
      resolveName={resolveDisplayNameBound}
      t={t}
      onSquareClick={handleSquareClick}
      onDeselectSquare={() => setSelectedSquare(null)}
      onPieceDrop={handlePieceDrop}
      onOfferDraw={offerDraw}
      onResign={resign}
      onAcceptDraw={acceptDraw}
    />
  );
  const themeVariant =
    (room?.gameOptions?.theme as string | undefined) ??
    (room?.gameOptions?.cardVariant as string | undefined) ??
    (room?.gameOptions?.variant as string | undefined) ??
    'cyberpunk';

  const modals = (
    <>
      <ChessGameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={dismiss}
        onRematch={result ? onRematchClick : undefined}
        rematchLoading={rematchLoading}
        t={t}
        messages={resultMessages}
        snapshot={displaySnapshot}
        theme={themeVariant}
      />
      <RematchInvitationModal
        isOpen={!!invitation}
        senderName={invitation?.hostName || ''}
        message={invitation?.message}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        t={t}
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
    <ChessThemeProvider variant={themeVariant}>
      <GameWidgetContainer
        theme={themeVariant}
        board={board}
        modals={modals}
        isMyTurn={displayMyTurn}
        isGameOver={isGameOver}
        loading={!snapshot}
        a11yAnnouncement={a11yAnnouncement}
        headerProps={{
          variantEmoji: '♟',
          title: t('games.chess_v1.name'),
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
    </ChessThemeProvider>
  );
}
export default memo(ChessGameImpl);
