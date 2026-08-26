'use client';

import { memo, useCallback, useMemo } from 'react';
import { Button } from '@arcadeum/ui';
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
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GoGameProps } from '../types';
import { useGoState } from '../hooks/useGoState';
import { useGoActions } from '../hooks/useGoActions';
import { GoThemeProvider } from '../lib/GoThemeContext';
import { GoLobby } from './GoLobby';
import { GoBoard } from './GoBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { GO_KOMI, GO_VARIANTS, resolveGoOptions } from '../lib/constants';

function GoGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  showRulesOpen,
  onShowRulesClose,
}: GoGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

  const isLobby = room?.status === 'lobby';

  const { snapshot, currentPlayerId, myTurn, isGameOver, startBusy, session } =
    useGoState({
      roomId,
      currentUserId,
      initialSession,
    });

  const { startSession, placeStone, passTurn } = useGoActions({
    roomId,
    userId: currentUserId,
  });

  const myColor = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return (
      snapshot.players.find((p) => p.playerId === currentUserId)?.color ?? null
    );
  }, [snapshot, currentUserId]);

  const resolveDisplayNameBound = useCallback(
    (id?: string | null) =>
      resolveDisplayName(id, {
        currentUserId,
        members: room?.members,
        playerOrder: snapshot?.playerOrder,
      }),
    [currentUserId, room, snapshot],
  );

  const sendChat = useGameChatSend(roomId, currentUserId, 'go_v1');
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'go_v1',
    gameOverKey: 'games.go_v1.gameOver',
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
    gameId: 'go_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const options = useMemo(
    () => resolveGoOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () => GO_VARIANTS.find((v) => v.id === options.variant) ?? GO_VARIANTS[0],
    [options.variant],
  );

  const a11yAnnouncement = useMemo(() => {
    if (!snapshot) return undefined;
    if (isGameOver) {
      return t(
        `games.go_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
      );
    }
    if (myTurn) return t('games.go_v1.status.yourTurn');
    return t('games.go_v1.status.waiting');
  }, [snapshot, isGameOver, result, myTurn, t]);

  const handlePass = useCallback(() => {
    passTurn();
  }, [passTurn]);

  if (!room) return null;

  const visualTheme = options.theme ?? options.variant ?? 'adventure';

  if (isLobby) {
    return (
      <GoThemeProvider variant={visualTheme}>
        <GoLobby
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
      </GoThemeProvider>
    );
  }

  const board = (
    <div className="box-border flex w-full max-w-2xl mx-auto flex-col items-center gap-4 p-2 sm:p-4">
      {snapshot ? (
        <>
          <TurnBadge
            currentPlayerId={currentPlayerId}
            myTurn={myTurn}
            isGameOver={isGameOver}
            resolveName={resolveDisplayNameBound}
            captures={snapshot.captures}
          />
          <div className="flex w-full flex-col items-center gap-4">
            <GoBoard
              board={snapshot.board}
              size={snapshot.boardSize ?? snapshot.options.boardSize ?? 9}
              disabled={!myTurn || isGameOver}
              lastMove={snapshot.lastMove}
              koPoint={snapshot.koPoint}
              myColor={myColor}
              ariaLabel={t('games.go_v1.board.ariaLabel', {
                size: snapshot.boardSize ?? snapshot.options.boardSize ?? 9,
              })}
              onCellClick={placeStone}
            />
            {!isGameOver && myTurn ? (
              <Button
                variant="secondary"
                size="md"
                data-testid="go-pass-button"
                onClick={handlePass}
              >
                {t('games.go_v1.game.pass')}
              </Button>
            ) : null}
            {snapshot.scores ? (
              <div
                data-testid="go-final-scores"
                className="text-center text-sm font-semibold opacity-90"
              >
                ⚫ {snapshot.scores.black} · ⚪ {snapshot.scores.white}{' '}
                {`(komi +${GO_KOMI})`}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={[]}
        currentUserId={currentUserId}
        gameName={t('games.go_v1.name')}
        theme={visualTheme}
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
          viewLabel: t('games.table.analytics.view'),
          backLabel: t('games.table.analytics.back'),
        }}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );

  return (
    <GoThemeProvider variant={visualTheme}>
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
          title: 'Go',
          subtitle: room?.name,
          turn: {
            onClockUserId: currentPlayerId,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </GoThemeProvider>
  );
}

export default memo(GoGameImpl);
