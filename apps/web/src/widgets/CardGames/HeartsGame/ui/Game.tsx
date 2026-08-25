'use client';

import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
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
import type { HeartsGameProps } from '../types';
import { useHeartsState } from '../hooks/useHeartsState';
import { useHeartsActions } from '../hooks/useHeartsActions';
import { legalCardIds } from '../lib/legal-cards';
import { HeartsThemeProvider } from '../lib/HeartsThemeContext';
import { HeartsLobby } from './HeartsLobby';
import { HeartsBoard } from './HeartsBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { HEARTS_VARIANTS } from '../lib/constants';
import { resolveHeartsVariant } from '../lib/theme';

function HeartsGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: HeartsGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);
  const isLobby = room?.status === 'lobby';

  const {
    snapshot,
    currentEntryId,
    myTurn,
    isGameOver,
    hasPassed,
    myHand,
    startBusy,
    session,
  } = useHeartsState({ roomId, currentUserId, initialSession });

  const { startSession, passCards, playCard } = useHeartsActions({
    roomId,
    userId: currentUserId,
  });

  const { pendingStart, markPendingStart, clearPendingStart } = usePendingStart(
    session?.id,
  );

  const [selectedPassCards, setSelectedPassCards] = useState<string[]>([]);
  const prevPhaseRef = useRef(snapshot?.phase);

  useEffect(() => {
    if (!isLobby) clearPendingStart();
  }, [isLobby, clearPendingStart]);

  // Clear in-flight pass selections whenever the phase changes (e.g. all
  // passes resolved and the hand moved to the playing phase).
  useEffect(() => {
    if (snapshot?.phase !== prevPhaseRef.current) {
      prevPhaseRef.current = snapshot?.phase;
      setSelectedPassCards([]);
    }
  }, [snapshot?.phase]);

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

  const sendChat = useGameChatSend(roomId, currentUserId, 'hearts_v1');
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'hearts_v1',
    gameOverKey: 'games.hearts_v1.gameOver',
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
    gameId: 'hearts_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  const options = useMemo(
    () => ({ variant: resolveHeartsVariant(room?.gameOptions) }),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      HEARTS_VARIANTS.find((v) => v.id === options.variant) ??
      HEARTS_VARIANTS[0],
    [options.variant],
  );

  const legalIds = useMemo(
    () =>
      snapshot && snapshot.phase === 'playing'
        ? legalCardIds(snapshot, myHand)
        : [],
    [snapshot, myHand],
  );

  const handleTogglePassCard = useCallback((card: string) => {
    setSelectedPassCards((prev) => {
      if (prev.includes(card)) {
        return prev.filter((c) => c !== card);
      }
      if (prev.length >= 3) return prev;
      return [...prev, card];
    });
  }, []);

  const handleConfirmPass = useCallback(() => {
    if (selectedPassCards.length === 3) {
      passCards(selectedPassCards);
      setSelectedPassCards([]);
    }
  }, [selectedPassCards, passCards]);

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
      <HeartsThemeProvider variant={options.variant}>
        <HeartsLobby
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
      </HeartsThemeProvider>
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
            passDirection={snapshot.passDirection}
            members={room?.members}
          />
          <HeartsBoard
            snapshot={snapshot}
            currentUserId={currentUserId}
            myHand={myHand}
            legalIds={legalIds}
            canAct={myTurn}
            hasPassed={hasPassed}
            members={room?.members}
            onPlayCard={handlePlayCard}
            selectedCards={selectedPassCards}
            onToggleCard={handleTogglePassCard}
            onConfirmPass={handleConfirmPass}
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
        gameName={t('games.hearts_v1.name')}
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
          viewLabel: t('games.table.analytics.view'),
          backLabel: t('games.table.analytics.back'),
        }}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );

  return (
    <HeartsThemeProvider variant={visualTheme}>
      <GameWidgetContainer
        theme={visualTheme}
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: t('games.hearts_v1.name'),
          subtitle: room?.name,
          turn: {
            onClockUserId: currentEntryId ?? null,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </HeartsThemeProvider>
  );
}

export default memo(HeartsGameImpl);
