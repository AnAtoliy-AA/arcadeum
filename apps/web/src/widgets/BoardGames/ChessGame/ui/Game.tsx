'use client';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { GameWidgetContainer } from '@/features/games/ui/GameWidgetContainer';
import {
  useGameChatIntegration,
  useGameChatSend,
  useRematch,
  useGameRoomActions,
  useGameResultModal,
  useGameResult,
} from '@/features/games/hooks';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import {
  FILES,
  type ChessGameProps,
  type ChessClientState,
  type File,
  type Rank,
  type BoardPosition,
  type PieceType,
} from '../types';
import {
  useChessState,
  useChessActions,
  useChessSounds,
  useChessCoach,
  useStockfishAnalysis,
  useSquareClick,
  useChessPremoves,
  useChessStreamerOverlays,
  useChessGameSounds,
  useKeyboardMoveInput,
} from '../hooks';
import { useStreamerMode } from '../lib/streamer-mode';
import { calculateOptimisticChessState } from '../lib/optimisticMove';
import { getChessA11yAnnouncement } from '../lib/a11yAnnouncement';
import { downloadPGN } from '../lib/pgn';
import { findKingPosition } from '../lib/board-utils';
import { createDisplayNameResolver } from '../lib/displayNameResolver';
import { ChessLobby } from './ChessLobby';
import { ChessBoardPanel } from './ChessBoardPanel';
import { ChessGameModals } from './ChessGameModals';
import { ChessKeyboardInput } from './ChessKeyboardInput';
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
  const { playSound } = useChessSounds();
  const {
    startSession,
    movePiece,
    resign,
    offerDraw,
    acceptDraw,
    offerTakeback,
    acceptTakeback,
    declineTakeback,
  } = useChessActions({ roomId, userId: currentUserId });
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
  const { eval: liveEval, analyzing: liveEvalAnalyzing } = useStockfishAnalysis(
    {
      roomId,
      enabled: !isGameOver && !isLobby,
      board: displaySnapshot?.board,
    },
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
  const resolveDisplayNameBound = useMemo(
    () => createDisplayNameResolver(currentUserId, room, displaySnapshot),
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
  const {
    showResultModal,
    sharedResult,
    dismiss,
    toggle: toggleResult,
  } = useGameResultModal(session, result, resultMessages, isGameOver);
  const [userFlipped, setUserFlipped] = useState<boolean | null>(null);
  const flipped = userFlipped ?? myColor === 'black';
  const [confirmMoves, setConfirmMoves] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);
  const toggleFlip = useCallback(() => {
    setUserFlipped((prev) => !(prev ?? myColor === 'black'));
  }, [myColor]);
  const lastMove = useMemo(() => {
    if (!displaySnapshot?.moveHistory.length) return null;
    const last =
      displaySnapshot.moveHistory[displaySnapshot.moveHistory.length - 1];
    return { from: last.from, to: last.to };
  }, [displaySnapshot?.moveHistory]);
  const streamer = useChessStreamerOverlays({
    board: displaySnapshot?.board,
    myColor,
    bestMoveUci: liveEval?.pv?.[0],
  });
  const streamerMode = useStreamerMode();
  const premoves = useChessPremoves({
    snapshot: displaySnapshot,
    myColor,
    displayMyTurn,
    isGameOver,
    movePiece,
    applyOptimisticMove,
    playSound,
    selectedSquare,
    setSelectedSquare,
  });
  const { handlePremoveSquareClick, handlePremovePieceDrop } = premoves;
  useChessGameSounds({
    displaySnapshot,
    isGameOver,
    playSound,
  });
  const regularLegalMoves = useMemo(() => {
    if (!selectedSquare || !displaySnapshot) return [];
    return (displaySnapshot.legalMovesForCurrentPlayer ?? [])
      .filter(
        (m) =>
          m.from.file === selectedSquare.file &&
          m.from.rank === selectedSquare.rank,
      )
      .map((m) => m.to);
  }, [selectedSquare, displaySnapshot]);
  const activeLegalMoves = displayMyTurn
    ? regularLegalMoves
    : premoves.premoveLegalMoves;
  const spectatorCount =
    room?.members && displaySnapshot?.players
      ? room.members.filter(
          (m) => !displaySnapshot.players.map((p) => p.playerId).includes(m.id),
        ).length
      : 0;
  const kingPosition = displaySnapshot
    ? findKingPosition(displaySnapshot)
    : null;
  const handleSquareClick = useSquareClick({
    displaySnapshot,
    myColor,
    selectedSquare,
    legalMoves: activeLegalMoves,
    isGameOver,
    movePiece,
    applyOptimisticMove,
    playSound,
    confirmMoves,
    pendingMove,
    setPendingMove,
    setSelectedSquare,
    setPendingPromotion,
  });
  const onSquareClick = useCallback(
    (file: File, rank: Rank) =>
      displayMyTurn
        ? handleSquareClick(file, rank)
        : handlePremoveSquareClick(file, rank),
    [displayMyTurn, handleSquareClick, handlePremoveSquareClick],
  );
  const keyboardInput = useKeyboardMoveInput({
    enabled: displayMyTurn && !isGameOver,
    legalMoves: displaySnapshot?.legalMovesForCurrentPlayer ?? [],
    onMove: useCallback(
      (fromFile: File, fromRank: Rank, toFile: File, toRank: Rank) => {
        applyOptimisticMove(fromFile, fromRank, toFile, toRank);
        movePiece(fromFile, fromRank, toFile, toRank);
      },
      [applyOptimisticMove, movePiece],
    ),
  });
  const handlePromotionSelect = useCallback(
    (pieceType: PieceType) => {
      if (!pendingPromotion) return;
      const { from, to } = pendingPromotion;
      applyOptimisticMove(from.file, from.rank, to.file, to.rank, pieceType);
      movePiece(from.file, from.rank, to.file, to.rank, pieceType);
      setPendingPromotion(null);
    },
    [pendingPromotion, applyOptimisticMove, movePiece],
  );
  const handlePieceDrop = useCallback(
    (fromFile: File, fromRank: Rank, toFile: File, toRank: Rank) => {
      if (isGameOver || !myColor || !displaySnapshot) return;
      if (!displayMyTurn) {
        handlePremovePieceDrop(fromFile, fromRank, toFile, toRank);
        return;
      }
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
      handlePremovePieceDrop,
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
  const liveAlternatives = liveEval?.alternatives ?? null;
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
      isFlipped={flipped}
      displayMyTurn={displayMyTurn}
      isGameOver={isGameOver}
      isSpectator={isSpectator}
      selectedSquare={selectedSquare}
      legalMoves={activeLegalMoves}
      lastMove={lastMove}
      kingPosition={kingPosition}
      coach={coach}
      currentUserId={currentUserId}
      resolveName={resolveDisplayNameBound}
      t={t}
      onSquareClick={onSquareClick}
      onDeselectSquare={() => {
        setSelectedSquare(null);
        setPendingMove(null);
      }}
      onPieceDrop={handlePieceDrop}
      onOfferDraw={offerDraw}
      onResign={resign}
      onAcceptDraw={acceptDraw}
      onOfferTakeback={offerTakeback}
      onAcceptTakeback={acceptTakeback}
      onDeclineTakeback={declineTakeback}
      liveEval={liveEval}
      liveEvalAnalyzing={liveEvalAnalyzing}
      onFlipBoard={toggleFlip}
      onExportPgn={() => {
        if (displaySnapshot) downloadPGN(displaySnapshot);
      }}
      onToggleConfirmMoves={() => {
        setConfirmMoves((c) => !c);
        setPendingMove(null);
      }}
      confirmMoves={confirmMoves}
      moveCandidates={liveAlternatives}
      pendingMove={pendingMove}
      premoveQueue={premoves.premoveQueue}
      virtualBoard={premoves.virtualBoard}
      onCancelPremoves={premoves.cancelPremoves}
      bestMoveArrow={streamer.bestMoveArrow}
      threatArrows={streamer.threatArrows}
      showBestMove={streamerMode.enabled || streamer.showBestMove}
      showThreats={streamerMode.enabled || streamer.showThreats}
      onToggleBestMove={streamer.toggleBestMove}
      onToggleThreats={streamer.toggleThreats}
      spectatorCount={spectatorCount}
    />
  );
  const themeVariant =
    (room?.gameOptions?.theme as string | undefined) ??
    (room?.gameOptions?.cardVariant as string | undefined) ??
    (room?.gameOptions?.variant as string | undefined) ??
    'cyberpunk';
  const modals = (
    <ChessGameModals
      showResultModal={showResultModal}
      sharedResult={sharedResult}
      dismiss={dismiss}
      onRematchClick={result ? onRematchClick : undefined}
      rematchLoading={rematchLoading}
      t={t}
      resultMessages={resultMessages}
      displaySnapshot={displaySnapshot}
      myColor={myColor}
      isSpectator={isSpectator}
      themeVariant={themeVariant}
      invitation={invitation}
      handleAcceptInvitation={handleAcceptInvitation}
      handleDeclineInvitation={handleDeclineInvitation}
      showRulesOpen={showRulesOpen}
      onShowRulesClose={onShowRulesClose}
      pendingPromotion={pendingPromotion}
      handlePromotionSelect={handlePromotionSelect}
      setPendingPromotion={() => setPendingPromotion(null)}
      myColorForPromo={myColor ?? 'white'}
    />
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
          onToggleResult: toggleResult,
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
      <ChessKeyboardInput keyboardInput={keyboardInput} />
    </ChessThemeProvider>
  );
}
export default memo(ChessGameImpl);
