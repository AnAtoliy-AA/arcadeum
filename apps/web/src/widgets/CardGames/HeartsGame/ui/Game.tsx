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
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { HeartsGameProps } from '../types';
import { useHeartsState } from '../hooks/useHeartsState';
import { useHeartsActions } from '../hooks/useHeartsActions';
import { HeartsThemeProvider } from '../lib/HeartsThemeContext';
import { HeartsLobby } from './HeartsLobby';
import { HeartsBoard } from './HeartsBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { HEARTS_VARIANTS } from '../lib/constants';
import type { HeartsVariant } from '../types';

function resolveOptions(raw: unknown): { variant: HeartsVariant } {
  const r = (raw ?? {}) as Partial<{ variant: string }>;
  return {
    variant: (r.variant ?? 'cyberpunk') as HeartsVariant,
  };
}

function HeartsGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
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

  if (snapshot?.phase !== prevPhaseRef.current) {
    prevPhaseRef.current = snapshot?.phase;
    if (selectedPassCards.length > 0) {
      setSelectedPassCards([]);
    }
  }

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

  const sendChat = useGameChatSend(roomId, currentUserId, 'hearts_v1');
  useGameChatIntegration(snapshot?.logs, sendChat);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'hearts_v1',
    gameOverKey: 'games.hearts_v1.gameOver',
    winnerId: snapshot?.winnerIds?.[0] ?? null,
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

  const variantTokens = useMemo(
    () =>
      HEARTS_VARIANTS.find((v) => v.id === options.variant) ??
      HEARTS_VARIANTS[0],
    [options.variant],
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
          variant={options.variant}
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
            myTurn={myTurn}
            disabled={isGameOver}
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

  const visualTheme = options.variant ?? 'cyberpunk';

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={[]}
        currentUserId={currentUserId}
        gameName={(() => {
          const raw = t('games.names.hearts' as TranslationKey);
          return raw && raw !== 'games.names.hearts' ? raw : 'Hearts';
        })()}
        theme={visualTheme}
        t={t}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        variant={options.variant}
      />
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
          title: 'Hearts',
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
