'use client';

import { memo, useCallback, useMemo } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameEndState,
  useGameRoomActions,
} from '@/features/games/hooks';
import { computeGameResult } from '@/features/games/lib/computeGameResult';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useRecordGameResult } from '@/features/stats/hooks/useRecordGameResult';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useGameChatStore } from '@/widgets/GameChat';
import type { TicTacToeGameProps } from '../types';
import { useTicTacToeState } from '../hooks/useTicTacToeState';
import { useTicTacToeActions } from '../hooks/useTicTacToeActions';
import { TicTacToeThemeProvider } from '../lib/TicTacToeThemeContext';
import { TicTacToeLobby } from './TicTacToeLobby';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { WIN_LENGTHS } from '../types';
import { TIC_TAC_TOE_VARIANTS } from '../lib/constants';
import {
  type BoardSize,
  type TicTacToeOptions,
  type TicTacToeVariant,
} from '../types';

function resolveOptions(raw: unknown): TicTacToeOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    boardSize: number | string;
    teamMode: boolean;
    expansionMargin: number;
    infinityWinLength: number;
  }>;
  const isSize = (n: number | string | undefined): n is BoardSize =>
    n === 3 || n === 5 || n === 7 || n === 9 || n === 'infinity';
  const isMargin = (n: number | undefined): n is 1 | 2 | 3 =>
    n === 1 || n === 2 || n === 3;
  const isWinLen = (n: number | undefined): n is 4 | 5 => n === 4 || n === 5;
  return {
    variant: (r.variant ?? 'classic') as TicTacToeVariant,
    boardSize: isSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
    expansionMargin: isMargin(r.expansionMargin) ? r.expansionMargin : 3,
    infinityWinLength: isWinLen(r.infinityWinLength) ? r.infinityWinLength : 5,
  };
}

function TicTacToeGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  showRulesOpen,
  onShowRulesClose,
}: TicTacToeGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

  const isLobby = room?.status === 'lobby';

  const {
    snapshot,
    currentEntryId,
    currentShooterId,
    myTurn,
    isGameOver,
    startBusy,
    session,
  } = useTicTacToeState({
    roomId,
    currentUserId,
    initialSession,
  });

  const { startSession, placeMark } = useTicTacToeActions({
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

  // Pipe engine logs into the shared GameChat and send chat via the generic
  // session history-note event (the BE appends it to the session logs and
  // rebroadcasts, so it shows in the shared panel + popup).
  const sendChat = useGameChatSend(roomId, currentUserId, 'tic_tac_toe_v1');
  useGameChatIntegration(
    snapshot?.logs as never,
    sendChat,
    resolveDisplayNameBound,
  );

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.winnerId,
    isDraw: snapshot?.isDraw,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  useRecordGameResult(result, 'tic_tac_toe_v1', session?.id);

  const gameEnd = useGameEndState({
    roomId,
    currentUserId,
    session,
    isGameOver,
    result,
    resultMessages: result
      ? {
          title: t(
            `games.tic_tac_toe_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
          ),
          message: t(
            `games.tic_tac_toe_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
          ),
        }
      : undefined,
  });

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const highlightedCell = useGameChatStore((s) => s.highlightedCell);
  const persistedCell = useGameChatStore((s) => s.persistedCell);
  const effectiveHighlight = highlightedCell ?? persistedCell;

  const variantTokens = useMemo(
    () =>
      TIC_TAC_TOE_VARIANTS.find((v) => v.id === options.variant) ??
      TIC_TAC_TOE_VARIANTS[0],
    [options.variant],
  );

  if (!room) return null;

  // Lobby renders OUTSIDE GameWidgetContainer so it gets full page height
  // (sea-battle does the same). The container's `board` slot is sized for
  // the in-game grid and squeezes anything else.
  if (isLobby) {
    return (
      <TicTacToeThemeProvider variant={options.variant}>
        <TicTacToeLobby
          room={room}
          userId={currentUserId ?? ''}
          isHost={isHost}
          startBusy={startBusy}
          onStartGame={(opts) =>
            startSession({
              withBots: !!opts?.withBots,
              botCount: opts?.botCount,
            })
          }
          onLeaveRoom={() => onLeaveRoom(currentUserId ?? '')}
          onDeleteRoom={onDeleteRoom}
          onKickPlayer={(userId) => onKickPlayer(userId, currentUserId ?? '')}
          onRefresh={onRefresh}
          showRulesOpen={showRulesOpen}
          onShowRulesClose={onShowRulesClose}
        />
      </TicTacToeThemeProvider>
    );
  }

  const board = (
    <div className="flex flex-col gap-3 items-stretch p-3 w-full">
      {snapshot ? (
        <>
          <TurnBadge
            currentEntryId={currentEntryId}
            currentShooterId={currentShooterId}
            teamMode={snapshot.options.teamMode}
            players={snapshot.players}
            teams={snapshot.teams}
            myTurn={myTurn}
            resolveName={resolveDisplayNameBound}
          />
          <TicTacToeBoard
            board={snapshot.board}
            winLine={snapshot.winLine}
            players={snapshot.players}
            teams={snapshot.teams}
            teamMode={snapshot.options.teamMode}
            origin={snapshot.origin}
            disabled={!myTurn || isGameOver}
            highlightedCell={effectiveHighlight}
            currentPlayerId={currentUserId}
            ariaLabel={`Tic-Tac-Toe ${snapshot.options.boardSize}x${snapshot.options.boardSize} board`}
            onCellClick={(row, col) => {
              useGameChatStore.getState().setPersistedCell(null);
              placeMark(row, col);
            }}
          />
        </>
      ) : null}
    </div>
  );

  const inGameBoardSize = snapshot?.options.boardSize ?? options.boardSize;

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={[]}
        currentUserId={currentUserId}
        t={t}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        boardSize={inGameBoardSize}
        winLength={WIN_LENGTHS[inGameBoardSize]}
      />
    </>
  );

  return (
    <TicTacToeThemeProvider variant={options.variant}>
      <GameWidgetContainer
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Tic-Tac-Toe',
          subtitle: room?.name,
          turn: {
            onClockUserId: currentShooterId,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </TicTacToeThemeProvider>
  );
}

export default memo(TicTacToeGameImpl);
