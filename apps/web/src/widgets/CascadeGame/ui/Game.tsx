'use client';

import { memo, useCallback, useMemo } from 'react';
import { YStack } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import {
  useGameChatIntegration,
  useGameChatSend,
  useRematch,
  useGameRoomActions,
  useGameResultModal,
  usePendingStart,
} from '@/features/games/hooks';
import { computeGameResult } from '@/features/games/lib/computeGameResult';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CascadeGameProps } from '../types';
import { useCascadeState } from '../hooks/useCascadeState';
import { useCascadeActions } from '../hooks/useCascadeActions';
import { CascadeThemeProvider } from '../lib/CascadeThemeContext';
import { CascadeLobby } from './CascadeLobby';
import { CascadeBoard } from './CascadeBoard';
import { TurnBadge } from './TurnBadge';
import { RulesModal } from './RulesModal';
import { CASCADE_VARIANTS } from '../lib/constants';
import {
  type ActiveColor,
  CASCADE_MODE_IDS,
  type CascadeMode,
  type CascadeOptions,
  type CascadeVariant,
} from '../types';

function resolveOptions(raw: unknown): CascadeOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    mode: string;
    stackingEnabled: boolean;
    lastCardCallEnabled: boolean;
    cardStyle: string;
  }>;
  const mode: CascadeMode = (
    CASCADE_MODE_IDS as ReadonlyArray<string>
  ).includes(r.mode ?? '')
    ? (r.mode as CascadeMode)
    : 'classic';
  return {
    variant: (r.variant ?? 'cosmic') as CascadeVariant,
    mode,
    stackingEnabled: mode !== 'pure',
    lastCardCallEnabled:
      typeof r.lastCardCallEnabled === 'boolean' ? r.lastCardCallEnabled : true,
    cardStyle: r.cardStyle === 'aurora' ? 'aurora' : 'neon',
  };
}

function CascadeGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  showRulesOpen,
  onShowRulesClose,
}: CascadeGameProps) {
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
  } = useCascadeState({ roomId, currentUserId, initialSession });

  const { startSession, playCard, draw, callCascade } = useCascadeActions({
    roomId,
    userId: currentUserId,
  });

  const { pendingStart, markPendingStart } = usePendingStart(session?.id);

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

  const sendChat = useGameChatSend(roomId, currentUserId, 'cascade_v1');
  useGameChatIntegration(snapshot?.logs as never, sendChat);

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.winnerId,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  const { showResultModal, sharedResult, resultMessages, dismiss } =
    useGameResultModal(
      session,
      result,
      result
        ? {
            title: t(
              `games.cascade_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
            message: t(
              `games.cascade_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}`,
            ),
          }
        : undefined,
    );

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      CASCADE_VARIANTS.find((v) => v.id === options.variant) ??
      CASCADE_VARIANTS[0],
    [options.variant],
  );

  const onRematchClick = useCallback(() => {
    void handleRematch([], undefined);
  }, [handleRematch]);

  const handlePlayCard = useCallback(
    (cardId: string, chosenColor?: ActiveColor) => {
      playCard(cardId, chosenColor);
    },
    [playCard],
  );

  if (!room) return null;

  if (isLobby) {
    return (
      <CascadeThemeProvider variant={options.variant}>
        <CascadeLobby
          room={room}
          isHost={isHost}
          startBusy={startBusy || pendingStart}
          onStartGame={handleStartGame}
          onLeaveRoom={() => onLeaveRoom(currentUserId ?? '')}
          onDeleteRoom={onDeleteRoom}
          onKickPlayer={(userId) => onKickPlayer(userId, currentUserId ?? '')}
          onRefresh={onRefresh}
          showRulesOpen={showRulesOpen}
          onShowRulesClose={onShowRulesClose}
        />
      </CascadeThemeProvider>
    );
  }

  const board = (
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
      {snapshot ? (
        <>
          <TurnBadge
            currentEntryId={currentEntryId}
            myTurn={myTurn}
            activeColor={snapshot.activeColor}
            direction={snapshot.direction}
            pendingDraw={snapshot.pendingDraw}
          />
          <CascadeBoard
            snapshot={snapshot}
            currentUserId={currentUserId}
            myHand={myHand}
            myTurn={myTurn}
            disabled={isGameOver}
            cardStyle={options.cardStyle}
            onPlayCard={handlePlayCard}
            onDraw={draw}
            onCallCascade={callCascade}
          />
        </>
      ) : null}
    </YStack>
  );

  const modals = (
    <>
      <GameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={dismiss}
        onRematch={result ? onRematchClick : undefined}
        rematchLoading={rematchLoading}
        t={t}
        messages={resultMessages}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        variant={options.variant}
      />
    </>
  );

  return (
    <CascadeThemeProvider variant={options.variant}>
      <GameWidgetContainer
        board={board}
        modals={modals}
        variant={options.variant}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Cascade',
          subtitle: room?.name,
          turn: {
            onClockUserId: currentEntryId ?? null,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </CascadeThemeProvider>
  );
}

export default memo(CascadeGameImpl);
