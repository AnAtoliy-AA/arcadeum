'use client';

import { memo, useCallback, useMemo } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameRoomActions,
  useGameResult,
  useGameEndState,
} from '@/features/games/hooks';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useTranslation } from '@/shared/lib/useTranslation';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type {
  BackgammonGameProps,
  BackgammonOptions,
  BackgammonVariant,
} from '../types';
import { useBackgammonState } from '../hooks/useBackgammonState';
import { useBackgammonActions } from '../hooks/useBackgammonActions';
import { BackgammonThemeProvider } from '../lib/BackgammonThemeContext';
import { BackgammonLobby } from './BackgammonLobby';
import { BackgammonBoard } from './BackgammonBoard';
import { RulesModal } from './RulesModal';
import { BACKGAMMON_VARIANTS } from '../lib/constants';

function resolveOptions(raw: unknown): BackgammonOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    aiDifficulty: string;
  }>;
  return {
    variant: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonVariant,
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

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(() => {
    const found = BACKGAMMON_VARIANTS.find((v) => v.id === options.variant);
    return found ?? BACKGAMMON_VARIANTS[0];
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
      />
      <RulesModal onClose={onShowRulesClose} open={showRulesOpen} />
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
