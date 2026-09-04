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
import type {
  BackgammonGameProps,
  BackgammonOptions,
  BackgammonTheme,
} from '../types';
import { useBackgammonState } from '../hooks/useBackgammonState';
import { useBackgammonActions } from '../hooks/useBackgammonActions';
import { BackgammonThemeProvider } from '../lib/BackgammonThemeContext';
import { BackgammonLobby } from './BackgammonLobby';
import { BackgammonBoard } from './BackgammonBoard';
import { RulesModal } from './RulesModal';
import { BACKGAMMON_THEMES } from '../lib/constants';

function resolveOptions(raw: unknown): BackgammonOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    aiDifficulty: string;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonTheme,
    variant: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonTheme,
    mode: (r.mode ?? 'standard') as
      'standard' | 'long' | 'hyper' | 'tavla' | 'nackgammon' | 'gulbara',
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

function BackgammonGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: BackgammonGameProps) {
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
  } = useBackgammonState({
    roomId,
    currentUserId,
    initialSession,
  });

  const { startSession, rollDice, moveChecker } = useBackgammonActions({
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

  const sendChat = useGameChatSend(roomId, currentUserId, 'backgammon_v1');
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
    gameId: 'backgammon_v1',
    gameOverKey: 'games.backgammon_v1.gameOver',
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
    gameId: 'backgammon_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(() => {
    const found = BACKGAMMON_THEMES.find((v) => v.id === options.variant);
    return found ?? BACKGAMMON_THEMES[0];
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
      <BackgammonThemeProvider variant={options.variant}>
        <BackgammonLobby
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
      </BackgammonThemeProvider>
    );
  }

  const board = (
    <div className="box-border flex w-full flex-col items-stretch p-1 sm:p-2">
      {snapshot ? (
        <BackgammonBoard
          currentUserId={currentUserId}
          myTurn={myTurn}
          onMove={moveChecker}
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
        gameName={t('games.backgammon_v1.name')}
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
      <RulesModal
        mode={options.mode}
        onClose={onShowRulesClose}
        open={showRulesOpen}
      />
    </>
  );

  return (
    <BackgammonThemeProvider variant={options.variant}>
      <GameWidgetContainer
        board={board}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: t('games.backgammon_v1.name'),
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
    </BackgammonThemeProvider>
  );
}

export const BackgammonGame = memo(BackgammonGameImpl);
export default BackgammonGame;
