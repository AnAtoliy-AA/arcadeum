'use client';

import { memo, useCallback, useMemo } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameEndState,
  useGameResult,
  useGameRoomActions,
} from '@/features/games/hooks';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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
    theme: string;
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
  const theme = (r.theme ?? r.variant ?? 'adventure') as TicTacToeVariant;
  return {
    variant: theme,
    theme,
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

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      useGameChatStore.getState().setPersistedCell(null);
      placeMark(row, col);
    },
    [placeMark],
  );

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
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'tic_tac_toe_v1',
    gameOverKey: 'games.tic_tac_toe_v1.gameOver',
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
    gameId: 'tic_tac_toe_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
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

  const a11yAnnouncement = useMemo(() => {
    if (!snapshot) return undefined;
    if (isGameOver) {
      return t(
        `games.tic_tac_toe_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
      );
    }
    if (currentEntryId && currentEntryId === currentUserId) {
      return t('games.tic_tac_toe_v1.status.yourTurn');
    }
    return t('games.tic_tac_toe_v1.status.waiting');
  }, [snapshot, isGameOver, result, currentEntryId, currentUserId, t]);

  if (!room) return null;

  const visualTheme = options.theme ?? options.variant ?? 'cyberpunk';

  // Lobby renders OUTSIDE GameWidgetContainer so it gets full page height
  // (sea-battle does the same). The container's `board` slot is sized for
  // the in-game grid and squeezes anything else.
  if (isLobby) {
    return (
      <TicTacToeThemeProvider variant={visualTheme}>
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
            onCellClick={handleCellClick}
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
        gameName={(() => {
          const raw = t('games.names.ticTacToe' as TranslationKey);
          return raw && raw !== 'games.names.ticTacToe' ? raw : 'Tic-Tac-Toe';
        })()}
        theme={visualTheme}
        t={t}
        stats={analytics.stats}
        analysis={{
          content: (
            <PostGameAnalytics
              stats={analytics.stats}
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
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        boardSize={inGameBoardSize}
        winLength={WIN_LENGTHS[inGameBoardSize]}
      />
    </>
  );

  return (
    <TicTacToeThemeProvider variant={visualTheme}>
      <GameWidgetContainer
        theme={visualTheme}
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        a11yAnnouncement={a11yAnnouncement}
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
