'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { GameWidgetContainer } from '@/features/games/ui/GameWidgetContainer';
import { GameEndModals } from '@/features/games/ui/GameEndModals';
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
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useGameSound } from '@/shared/lib/game-sounds';
import type { GoGameProps } from '../types';
import { useGoState } from '../hooks/useGoState';
import { useGoActions } from '../hooks/useGoActions';
import { GoThemeProvider } from '../lib/GoThemeContext';
import { GoLobby } from './GoLobby';
import { GoBoard } from './GoBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { ResignDialog } from './ResignDialog';
import MoveHistory from './MoveHistory';
import { GO_KOMI, GO_THEMES, resolveGoOptions } from '../lib/constants';

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

  const { startSession, placeStone, passTurn, forfeit } = useGoActions({
    roomId,
    userId: currentUserId,
  });

  const { play } = useGameSound('go_v1');

  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showTerritory, setShowTerritory] = useState(false);

  const handlePlaceStone = useCallback(
    (...args: Parameters<typeof placeStone>) => {
      play('place');
      return placeStone(...args);
    },
    [placeStone, play],
  );

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
    () => GO_THEMES.find((v) => v.id === options.variant) ?? GO_THEMES[0],
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
    play('click');
    passTurn();
  }, [passTurn, play]);

  const handleResignConfirm = useCallback(() => {
    setShowResignDialog(false);
    play('click');
    forfeit();
  }, [forfeit, play]);

  const kifuMoves = useMemo(() => {
    if (!snapshot?.logs) return [];
    const moves: Array<{
      moveNumber: number;
      color: 'black' | 'white';
      row: number;
      col: number;
      captureCount?: number;
      isPass: boolean;
    }> = [];
    let moveNum = 0;

    for (const log of snapshot.logs) {
      if (log.type !== 'action') continue;
      const isBlack = log.message?.startsWith('Black');
      const isWhite = log.message?.startsWith('White');
      if (!isBlack && !isWhite) continue;

      const color = isBlack ? ('black' as const) : ('white' as const);
      const isPass = log.message?.includes('passed') ?? false;

      if (isPass) {
        moveNum++;
        moves.push({
          moveNumber: moveNum,
          color,
          row: -1,
          col: -1,
          isPass: true,
        });
      } else {
        const coordMatch = log.message?.match(/([A-HJ-Z])(\d+)/);
        if (coordMatch) {
          const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
          const col = letters.indexOf(coordMatch[1]);
          const row = snapshot.boardSize - parseInt(coordMatch[2], 10);
          const captureMatch = log.message?.match(/captured (\d+)/);
          moveNum++;
          moves.push({
            moveNumber: moveNum,
            color,
            row,
            col,
            captureCount: captureMatch
              ? parseInt(captureMatch[1], 10)
              : undefined,
            isPass: false,
          });
        }
      }
    }
    return moves;
  }, [snapshot]);

  const [kifuIndex, setKifuIndex] = useState(-1);

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
              showTerritory={showTerritory || isGameOver}
              ariaLabel={t('games.go_v1.board.ariaLabel', {
                size: snapshot.boardSize ?? snapshot.options.boardSize ?? 9,
              })}
              onCellClick={handlePlaceStone}
            />
            <div className="flex items-center gap-3 flex-wrap justify-center">
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
              {!isGameOver && myTurn ? (
                <Button
                  variant="secondary"
                  size="md"
                  data-testid="go-territory-toggle"
                  onClick={() => setShowTerritory((v) => !v)}
                  className={
                    showTerritory ? 'ring-2 ring-[var(--primary)]' : ''
                  }
                >
                  {t('games.go_v1.game.territory')}
                </Button>
              ) : null}
              {!isGameOver && myTurn ? (
                <Button
                  variant="secondary"
                  size="md"
                  data-testid="go-resign-button"
                  onClick={() => setShowResignDialog(true)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  {t('games.go_v1.game.resign')}
                </Button>
              ) : null}
            </div>
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
          <MoveHistory
            moves={kifuMoves}
            currentMoveIndex={kifuIndex}
            onMoveSelect={setKifuIndex}
            onFirst={() => setKifuIndex(0)}
            onPrev={() => setKifuIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setKifuIndex((i) => Math.min(kifuMoves.length - 1, i + 1))
            }
            onLast={() => setKifuIndex(kifuMoves.length - 1)}
          />
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
      <ResignDialog
        open={showResignDialog}
        onConfirm={handleResignConfirm}
        onCancel={() => setShowResignDialog(false)}
      />
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
          onToggleResult: gameEnd.toggleResult,
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
