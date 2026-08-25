'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameRoomActions,
  useGameResult,
  useGameEndState,
} from '@/features/games/hooks';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { Board, CheckersGameProps, MoveStep, RuleVariant } from '../types';
import { RULE_VARIANT_CONFIGS } from '../types';
import { useCheckersState } from '../hooks/useCheckersState';
import { useCheckersActions } from '../hooks/useCheckersActions';
import { CheckersThemeProvider } from '../lib/CheckersThemeContext';
import {
  findCapturesFrom,
  applyMoveToBoard,
  getPlayerColor,
} from '../lib/checkersClientLogic';
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
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
  );

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'checkers_v1',
    gameOverKey: 'games.checkers_v1.gameOver',
    winnerId: snapshot?.winnerId,
    isDraw: snapshot?.isDraw,
    t,
  });

  const gameEnd = useGameEndState({
    roomId,
    currentUserId,
    session,
    isGameOver,
    result,
    resultMessages,
  });

  const opponentId =
    snapshot?.players && currentUserId
      ? (snapshot.players.find((p) => p.playerId !== currentUserId)?.playerId ??
        null)
      : null;

  const analytics = usePostGameAnalytics({
    gameId: 'checkers_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const variant = useMemo(
    () =>
      (room?.gameOptions as Record<string, string>)?.theme ??
      (room?.gameOptions as Record<string, string>)?.variant ??
      'cyberpunk',
    [room?.gameOptions],
  );

  const ruleVariant = useMemo(
    () =>
      ((room?.gameOptions as Record<string, string>)?.ruleVariant ??
        'american') as RuleVariant,
    [room?.gameOptions],
  );

  const ruleConfig = RULE_VARIANT_CONFIGS[ruleVariant];
  const backwardCaptures = ruleConfig.backwardCapturesForMen;
  const flyingKings = ruleConfig.flyingKings;

  const variantTokens = useMemo(
    () =>
      CHECKERS_VARIANTS.find((v) => v.id === variant) ?? CHECKERS_VARIANTS[0],
    [variant],
  );

  const players = useMemo(
    () =>
      snapshot?.players.map((p) => ({
        playerId: p.playerId,
        displayName: resolveDisplayNameBound(p.playerId),
        alive: true,
      })) ?? [],
    [snapshot?.players, resolveDisplayNameBound],
  );

  const a11yAnnouncement = useMemo(() => {
    if (!snapshot) return undefined;
    if (isGameOver) {
      if (snapshot.isDraw) return t('games.checkers_v1.gameOver.draw');
      return t(
        `games.checkers_v1.gameOver.${result === 'won' ? 'won' : 'lost'}`,
      );
    }
    return myTurn
      ? t('games.checkers_v1.status.yourTurn')
      : t('games.checkers_v1.status.waiting');
  }, [snapshot, isGameOver, myTurn, result, t]);

  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [pendingSteps, setPendingSteps] = useState<MoveStep[]>([]);
  const [optimisticBoard, setOptimisticBoard] = useState<Board | null>(null);
  const [lastServerBoard, setLastServerBoard] = useState<Board | null>(null);

  const playerColor = useMemo(
    () =>
      currentUserId && snapshot
        ? getPlayerColor(snapshot.players, currentUserId)
        : null,
    [snapshot, currentUserId],
  );

  const isFlipped = playerColor === 'dark';

  const displayBoard = optimisticBoard ?? snapshot?.board ?? null;

  // Clear optimistic board when server state changes
  if (snapshot?.board && snapshot.board !== lastServerBoard) {
    setLastServerBoard(snapshot.board);
    if (optimisticBoard) {
      setOptimisticBoard(null);
    }
  }

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!snapshot || !currentUserId || isGameOver || !myTurn) return;
      if (!displayBoard) return;

      const piece = displayBoard[row][col];

      // If clicking own piece, select it (start or restart chain)
      if (piece && piece.playerId === currentUserId) {
        setSelectedPiece({ row, col });
        setPendingSteps([]);
        setOptimisticBoard(null);
        return;
      }

      // If clicking on a piece that isn't ours, ignore
      if (piece) return;

      // If a piece is selected and clicking empty, try to move
      if (selectedPiece) {
        const playerColor = getPlayerColor(snapshot.players, currentUserId);

        // Detect capture by checking available captures from the piece's current position
        const possibleCaptures = playerColor
          ? findCapturesFrom(
              displayBoard,
              selectedPiece.row,
              selectedPiece.col,
              currentUserId,
              playerColor,
              backwardCaptures,
              flyingKings,
            )
          : [];

        const matchedCapture = possibleCaptures.find(
          (c) => c.toRow === row && c.toCol === col,
        );

        const isCapture = !!matchedCapture;

        const moveStep: MoveStep = {
          fromRow: selectedPiece.row,
          fromCol: selectedPiece.col,
          toRow: row,
          toCol: col,
        };

        if (matchedCapture) {
          moveStep.capturedRow = matchedCapture.capturedRow;
          moveStep.capturedCol = matchedCapture.capturedCol;
        }

        const newSteps = [...pendingSteps, moveStep];

        if (isCapture) {
          const nextBoard = applyMoveToBoard(displayBoard, [moveStep]);

          // Check if more captures available from the landing square
          const moreCaptures = playerColor
            ? findCapturesFrom(
                nextBoard,
                row,
                col,
                currentUserId,
                playerColor,
                backwardCaptures,
                flyingKings,
              )
            : [];

          if (moreCaptures.length > 0) {
            // Multi-jump: keep piece selected at landing, show optimistic board
            setPendingSteps(newSteps);
            setOptimisticBoard(nextBoard);
            setSelectedPiece({ row, col });
          } else {
            // End of chain: send full chain to server, show optimistic board
            setOptimisticBoard(nextBoard);
            setSelectedPiece(null);
            setPendingSteps([]);
            movePiece(newSteps);
          }
        } else {
          // Simple move: send to server, show optimistic board
          const nextBoard = applyMoveToBoard(displayBoard, [moveStep]);
          setOptimisticBoard(nextBoard);
          setSelectedPiece(null);
          setPendingSteps([]);
          movePiece(newSteps);
        }
      }
    },
    [
      snapshot,
      currentUserId,
      isGameOver,
      myTurn,
      displayBoard,
      selectedPiece,
      pendingSteps,
      movePiece,
      backwardCaptures,
      flyingKings,
    ],
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
    <div className="flex flex-col gap-3 items-stretch p-3 w-full">
      {snapshot && displayBoard ? (
        <>
          <TurnBadge
            currentTurnUserId={currentTurnUserId}
            players={snapshot.players}
            myTurn={myTurn}
            resolveName={resolveDisplayNameBound}
          />
          <CheckersBoard
            board={displayBoard}
            players={snapshot.players}
            selectedPiece={selectedPiece}
            disabled={!myTurn || isGameOver}
            ariaLabel={`Checkers ${displayBoard.length}×${displayBoard.length} board`}
            onCellClick={handleCellClick}
            onDeselect={() => setSelectedPiece(null)}
            isFlipped={isFlipped}
          />
        </>
      ) : null}
    </div>
  );

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={players}
        currentUserId={currentUserId}
        gameName={(() => {
          const raw = t('games.names.checkers' as TranslationKey);
          return raw && raw !== 'games.names.checkers' ? raw : 'Checkers';
        })()}
        theme={variant}
        t={t}
        stats={analytics.stats}
        analysis={{
          content: (
            <PostGameAnalytics
              moveTimeline={analytics.moveTimeline}
              headToHead={analytics.headToHead}
              headToHeadLoading={analytics.headToHeadLoading}
              trends={analytics.trends}
              trendsLoading={analytics.trendsLoading}
              onLoadHeadToHead={analytics.loadHeadToHead}
              onLoadTrends={analytics.loadTrends}
              currentUserId={currentUserId}
              opponentId={opponentId}
              t={t}
            />
          ),
          viewLabel: t('games.table.analytics.view' as TranslationKey),
          backLabel: t('games.table.analytics.back' as TranslationKey),
        }}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );

  return (
    <CheckersThemeProvider variant={variant}>
      <GameWidgetContainer
        theme={variant}
        board={board}
        modals={modals}
        variant={variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        loading={!snapshot}
        a11yAnnouncement={a11yAnnouncement}
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
