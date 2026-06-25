'use client';

import { memo, useCallback, useMemo } from 'react';
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
import { useTranslation } from '@/shared/lib/useTranslation';
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
    boardSize: number;
    teamMode: boolean;
  }>;
  const isSize = (n: number | undefined): n is BoardSize =>
    n === 3 || n === 5 || n === 7 || n === 9;
  return {
    variant: (r.variant ?? 'classic') as TicTacToeVariant,
    boardSize: isSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
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
    (id?: string | null) => {
      if (!currentUserId || !room) return id || '';
      if (id === currentUserId) return 'You';
      if (id?.startsWith('bot-')) {
        const botOrder =
          snapshot?.playerOrder.filter((pId) => pId.startsWith('bot-')) || [];
        const botIndex = botOrder.indexOf(id);
        if (botIndex !== -1) return `Bot ${botIndex + 1}`;
        return 'Bot';
      }
      const member = room.members?.find((m) => m.id === id);
      if (member?.displayName && member.displayName !== 'Unknown')
        return member.displayName;
      return id || '';
    },
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

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.winnerId,
    isDraw: snapshot?.isDraw,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  const { showResultModal, sharedResult, resultMessages, dismiss } =
    useGameResultModal(
      session,
      result,
      result
        ? {
            title: t(
              `games.tic_tac_toe_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
            message: t(
              `games.tic_tac_toe_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
          }
        : undefined,
    );

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      TIC_TAC_TOE_VARIANTS.find((v) => v.id === options.variant) ??
      TIC_TAC_TOE_VARIANTS[0],
    [options.variant],
  );

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  if (!room) return null;

  // Lobby renders OUTSIDE GameWidgetContainer so it gets full page height
  // (sea-battle does the same). The container's `board` slot is sized for
  // the in-game grid and squeezes anything else.
  if (isLobby) {
    return (
      <TicTacToeThemeProvider variant={options.variant}>
        <TicTacToeLobby
          room={room}
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
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
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
            disabled={!myTurn || isGameOver}
            ariaLabel={`Tic-Tac-Toe ${snapshot.options.boardSize}x${snapshot.options.boardSize} board`}
            onCellClick={(row, col) => placeMark(row, col)}
          />
        </>
      ) : null}
    </YStack>
  );

  const inGameBoardSize = snapshot?.options.boardSize ?? options.boardSize;

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
