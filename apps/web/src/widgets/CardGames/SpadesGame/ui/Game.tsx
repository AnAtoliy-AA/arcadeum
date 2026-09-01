'use client';

import { memo, useCallback, useMemo, useEffect } from 'react';
import { GameWidgetContainer } from '@/features/games/ui/GameWidgetContainer';
import { GameEndModals } from '@/features/games/ui/GameEndModals';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameEndState,
  useGameResult,
  useGameRoomActions,
  usePendingStart,
} from '@/features/games/hooks';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { SpadesGameProps } from '../types';
import { useSpadesState } from '../hooks/useSpadesState';
import { useSpadesActions } from '../hooks/useSpadesActions';
import { legalCardIds } from '../lib/legal-cards';
import { SpadesThemeProvider } from '../lib/SpadesThemeContext';
import { SpadesLobby } from './SpadesLobby';
import { SpadesBoard } from './SpadesBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { SPADES_THEMES } from '../lib/constants';
import { resolveSpadesTheme } from '../lib/theme';

function SpadesGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: SpadesGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);
  const isLobby = room?.status === 'lobby';

  const {
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    isBidding,
    hasBid,
    myHand,
    startBusy,
    session,
  } = useSpadesState({ roomId, currentUserId, initialSession });

  const { startSession, bid, playCard } = useSpadesActions({
    roomId,
    userId: currentUserId,
  });

  const { pendingStart, markPendingStart, clearPendingStart } = usePendingStart(
    session?.id,
  );

  useEffect(() => {
    if (!isLobby) clearPendingStart();
  }, [isLobby, clearPendingStart]);

  const handleStartGame = useCallback(
    (opts?: { withBots?: boolean; botCount?: number }) => {
      markPendingStart();
      startSession({
        withBots: !!opts?.withBots,
        botCount: opts?.botCount,
      });
    },
    [startSession, markPendingStart],
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

  const sendChat = useGameChatSend(roomId, currentUserId, 'spades_v1');
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'spades_v1',
    gameOverKey: 'games.spades_v1.gameOver',
    winnerIds: snapshot?.winnerIds ?? null,
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
    gameId: 'spades_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const options = useMemo(
    () => ({ variant: resolveSpadesTheme(room?.gameOptions) }),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      SPADES_THEMES.find((v) => v.id === options.variant) ?? SPADES_THEMES[0],
    [options.variant],
  );

  const canBid =
    isBidding &&
    !hasBid &&
    snapshot?.playerOrder[snapshot.currentTurnIndex] === currentUserId;

  const legalIds = useMemo(
    () =>
      snapshot && snapshot.phase === 'playing'
        ? legalCardIds(snapshot, myHand)
        : [],
    [snapshot, myHand],
  );

  const handleBid = useCallback(
    (amount: number) => {
      bid(amount);
    },
    [bid],
  );

  const handlePlayCard = useCallback(
    (card: string) => {
      playCard(card);
    },
    [playCard],
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

  if (!room) return null;

  if (isLobby) {
    return (
      <SpadesThemeProvider variant={options.variant}>
        <SpadesLobby
          room={room}
          userId={currentUserId ?? ''}
          isHost={isHost}
          startBusy={startBusy || pendingStart}
          onStartGame={handleStartGame}
          onLeaveRoom={() => onLeaveRoom(currentUserId ?? '')}
          onDeleteRoom={onDeleteRoom}
          onKickPlayer={(userId) => onKickPlayer(userId, currentUserId ?? '')}
          onRefresh={onRefresh}
          showRulesOpen={showRulesOpen}
          onShowRulesClose={onShowRulesClose}
          accessToken={accessToken}
        />
      </SpadesThemeProvider>
    );
  }

  const board = (
    <div className="flex flex-col gap-3 items-stretch p-1 w-full">
      {snapshot ? (
        <>
          <TurnBadge
            currentEntryId={currentEntryId}
            myTurn={myTurn}
            phase={snapshot.phase}
            members={room?.members}
          />
          <SpadesBoard
            snapshot={snapshot}
            currentUserId={currentUserId}
            myHand={myHand}
            legalIds={legalIds}
            canAct={myTurn}
            canBid={canBid}
            hasBid={hasBid}
            members={room?.members}
            onPlayCard={handlePlayCard}
            onBid={handleBid}
          />
        </>
      ) : null}
    </div>
  );

  const visualTheme = options.variant;

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={players}
        currentUserId={currentUserId}
        gameName={t('games.spades_v1.name')}
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
    <SpadesThemeProvider variant={visualTheme}>
      <GameWidgetContainer
        theme={visualTheme}
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: t('games.spades_v1.name'),
          subtitle: room?.name,
          turn: {
            onClockUserId: currentEntryId ?? null,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </SpadesThemeProvider>
  );
}

export default memo(SpadesGameImpl);
