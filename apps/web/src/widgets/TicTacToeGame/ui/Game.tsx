'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { YStack } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useGameChatIntegration, useRematch } from '@/features/games/hooks';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ChatScope } from '@/shared/types/games';
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
          onLeaveRoom={() => storeLeaveRoom(roomId, currentUserId)}
          onDeleteRoom={() => void storeDeleteRoom(roomId)}
          onKickPlayer={(userId) =>
            storeKickPlayer(roomId, userId, currentUserId ?? '')
          }
          onRefresh={() => void storeRefreshRoom(roomId)}
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

  const sharedResult =
    result === 'won' ? 'victory' : result === 'lost' ? 'defeat' : result;
  const resultMessages = result
    ? {
        title:
          result === 'won'
            ? t('games.tic_tac_toe_v1.gameOver.won')
            : result === 'lost'
              ? t('games.tic_tac_toe_v1.gameOver.lost')
              : t('games.tic_tac_toe_v1.gameOver.draw'),
        message:
          result === 'won'
            ? t('games.tic_tac_toe_v1.gameOver.messages.won')
            : result === 'lost'
              ? t('games.tic_tac_toe_v1.gameOver.messages.lost')
              : t('games.tic_tac_toe_v1.gameOver.messages.draw'),
      }
    : undefined;

  const inGameBoardSize = snapshot?.options.boardSize ?? options.boardSize;

  const modals = (
    <>
      <GameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={() => setDismissedForSessionId(session?.id ?? null)}
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
