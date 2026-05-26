'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { YStack } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useGameChatIntegration, useRematch } from '@/features/games/hooks';
import type { ChatScope } from '@/shared/types/games';
import type { TicTacToeGameProps } from '../types';
import { useTicTacToeState } from '../hooks/useTicTacToeState';
import { useTicTacToeActions } from '../hooks/useTicTacToeActions';
import { TicTacToeThemeProvider } from '../lib/TicTacToeThemeContext';
import { TicTacToeLobby } from './TicTacToeLobby';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TurnBadge } from './TurnBadge';
import { TicTacToeGameOverModal } from './TicTacToeModals';
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
  const storeRoom = useGameStore((s: GameState) => s.room);
  const storeDeleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) ?? initialRoom ?? null;

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

  // Pipe engine logs into the shared GameChat. The shared chat infra has no
  // tic-tac-toe-specific send hook; users send chat via the shared composer.
  useGameChatIntegration(
    snapshot?.logs as never,
    (_msg: string, _scope: ChatScope) => {
      // Chat send wired through shared composer for now — no game-specific
      // socket event required.
      void _msg;
      void _scope;
    },
  );

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const [dismissedForSessionId, setDismissedForSessionId] = useState<
    string | null
  >(null);

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

  const result: 'won' | 'lost' | 'draw' | null = useMemo(() => {
    if (!snapshot || !isGameOver) return null;
    if (snapshot.isDraw) return 'draw';
    if (!snapshot.winnerId || !currentUserId) return 'lost';
    if (snapshot.options.teamMode) {
      const myPlayer = snapshot.players.find(
        (p) => p.playerId === currentUserId,
      );
      return myPlayer?.teamId === snapshot.winnerId ? 'won' : 'lost';
    }
    return snapshot.winnerId === currentUserId ? 'won' : 'lost';
  }, [snapshot, isGameOver, currentUserId]);

  const showResultModal =
    !!result && dismissedForSessionId !== (session?.id ?? null);

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  const board = (
    <YStack gap="$3" alignItems="center" padding="$3">
      {isLobby && room ? (
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
          onLeaveRoom={() => storeLeaveRoom(roomId, currentUserId)}
          onDeleteRoom={() => void storeDeleteRoom(roomId)}
          onKickPlayer={(userId) =>
            storeKickPlayer(roomId, userId, currentUserId ?? '')
          }
          onRefresh={() => void storeRefreshRoom(roomId)}
          showRulesOpen={showRulesOpen}
          onShowRulesClose={onShowRulesClose}
        />
      ) : snapshot ? (
        <>
          <TurnBadge
            currentEntryId={currentEntryId}
            currentShooterId={currentShooterId}
            teamMode={snapshot.options.teamMode}
            players={snapshot.players}
            teams={snapshot.teams}
            myTurn={myTurn}
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

  const modals = (
    <TicTacToeGameOverModal
      open={showResultModal}
      onClose={() => setDismissedForSessionId(session?.id ?? null)}
      result={result}
      onRematch={result ? onRematchClick : undefined}
      rematchLoading={rematchLoading}
    />
  );

  return (
    <TicTacToeThemeProvider variant={options.variant}>
      <GameWidgetContainer
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Tic-Tac-Toe',
          subtitle: room?.name,
          turnStatusVariant: isGameOver
            ? 'completed'
            : myTurn
              ? 'yourTurn'
              : 'waiting',
          turnStatusText: isGameOver ? 'Game over' : myTurn ? 'Your turn' : '—',
        }}
      />
    </TicTacToeThemeProvider>
  );
}

export default memo(TicTacToeGameImpl);
