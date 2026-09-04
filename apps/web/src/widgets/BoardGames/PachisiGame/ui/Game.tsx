'use client';

import { memo, useCallback, useMemo } from 'react';
import { GameWidgetContainer } from '@/features/games/ui/GameWidgetContainer';
import { GameEndModals } from '@/features/games/ui/GameEndModals';
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
import { useTranslation } from '@/shared/lib/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { PachisiGameProps, PachisiOptions, PachisiTheme } from '../types';
import { usePachisiState } from '../hooks/usePachisiState';
import { usePachisiActions } from '../hooks/usePachisiActions';
import { PachisiThemeProvider } from '../lib/PachisiThemeContext';
import { PachisiLobby } from './PachisiLobby';
import { PachisiBoard } from './PachisiBoard';
import { RulesModal } from './RulesModal';
import { PACHISI_THEMES } from '../lib/constants';

function resolveOptions(raw: unknown): PachisiOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    aiDifficulty: string;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? 'adventure') as PachisiTheme,
    variant: (r.theme ?? r.variant ?? 'adventure') as PachisiTheme,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

function PachisiGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: PachisiGameProps) {
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
  } = usePachisiState({
    roomId,
    currentUserId,
    initialSession,
  });

  const { startSession, rollDice, moveToken, passTurn } = usePachisiActions({
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

  const sendChat = useGameChatSend(roomId, currentUserId, 'pachisi_v1');
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
    gameId: 'pachisi_v1',
    gameOverKey: 'games.pachisi_v1.gameOver',
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
    gameId: 'pachisi_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(() => {
    const found = PACHISI_THEMES.find((v) => v.id === options.variant);
    return found ?? PACHISI_THEMES[0];
  }, [options.variant]);

  const players = useMemo(
    () =>
      snapshot?.players.map((p) => ({
        playerId: p.playerId,
        displayName: resolveDisplayNameBound(p.playerId),
        alive: p.alive,
      })) ?? [],
    [snapshot?.players, resolveDisplayNameBound],
  );

  const handleStartGame = useCallback(
    (startOpts?: {
      withBots?: boolean;
      botCount?: number;
      botDifficulty?: string;
    }) => {
      setStartBusy(true);
      startSession(startOpts);
    },
    [setStartBusy, startSession],
  );

  if (!room) return null;

  if (isLobby) {
    return (
      <PachisiThemeProvider variant={options.variant}>
        <PachisiLobby
          isHost={isHost}
          onDeleteRoom={onDeleteRoom}
          onKickPlayer={(userId) => onKickPlayer(userId, currentUserId ?? '')}
          onLeaveRoom={() => onLeaveRoom(currentUserId ?? '')}
          onRefresh={onRefresh}
          onReorderPlayers={handleReorderPlayers}
          onShowRulesClose={onShowRulesClose}
          onStartGame={handleStartGame}
          room={room}
          showRulesOpen={showRulesOpen}
          startBusy={startBusy}
          userId={currentUserId ?? ''}
        />
      </PachisiThemeProvider>
    );
  }

  const board = (
    <div className="box-border flex w-full flex-col items-stretch p-1 sm:p-2">
      {snapshot ? (
        <PachisiBoard
          currentUserId={currentUserId}
          myTurn={myTurn}
          onMove={moveToken}
          onPassTurn={passTurn}
          onRoll={rollDice}
          snapshot={snapshot}
        />
      ) : null}
    </div>
  );

  const modals = (
    <>
      <GameEndModals
        currentUserId={currentUserId}
        gameEnd={gameEnd}
        gameName={t('games.pachisi_v1.name')}
        players={players}
        t={t}
        theme={options.variant}
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
      <RulesModal onClose={onShowRulesClose} open={showRulesOpen} />
    </>
  );

  return (
    <PachisiThemeProvider variant={options.variant}>
      <GameWidgetContainer
        board={board}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: t('games.pachisi_v1.name'),
          subtitle: room?.name,
          onToggleResult: gameEnd.toggleResult,
          turn: {
            onClockUserId: currentTurnUserId,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
        isGameOver={isGameOver}
        isMyTurn={myTurn}
        modals={modals}
        theme={options.variant}
        variant={options.variant}
      />
    </PachisiThemeProvider>
  );
}

export const PachisiGame = memo(PachisiGameImpl);
export default PachisiGame;
