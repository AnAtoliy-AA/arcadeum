'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { YStack } from 'tamagui';
import { GameWidgetContainer } from '@/features/games/ui';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useGameChatIntegration, useRematch } from '@/features/games/hooks';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ChatScope } from '@/shared/types/games';
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
  const storeRoom = useGameStore((s: GameState) => s.room);
  const storeDeleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) ?? initialRoom ?? null;
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

  // The shared `useGameSession` only ever sets startBusy=false (on the
  // games.session.started event); nothing flips it to true on click. So
  // without this local pending flag the start button stays clickable
  // during the round-trip and users press it twice. We snapshot the
  // current session id at click time and clear the flag once a *different*
  // session id arrives — comparing IDs (not object refs) is robust against
  // a non-null initial session bleeding into the first render. 6s safety
  // timeout covers BE rejection (e.g. minimum-players error) where the
  // started event never arrives.
  const [pendingStart, setPendingStart] = useState(false);
  const [startTriggerSessionId, setStartTriggerSessionId] = useState<
    string | null
  >(null);
  if (pendingStart && session?.id && session.id !== startTriggerSessionId) {
    setPendingStart(false);
  }
  useEffect(() => {
    if (!pendingStart) return;
    const t = setTimeout(() => setPendingStart(false), 6000);
    return () => clearTimeout(t);
  }, [pendingStart]);

  const handleStartGame = useCallback(
    (opts?: { withBots?: boolean; botCount?: number }) => {
      setStartTriggerSessionId(session?.id ?? null);
      setPendingStart(true);
      startSession({
        withBots: !!opts?.withBots,
        botCount: opts?.botCount,
      });
    },
    [startSession, session?.id],
  );

  useGameChatIntegration(
    snapshot?.logs as never,
    (_msg: string, _scope: ChatScope) => {
      void _msg;
      void _scope;
    },
  );

  const { rematchLoading, handleRematch } = useRematch({ roomId });

  const [dismissedForSessionId, setDismissedForSessionId] = useState<
    string | null
  >(null);

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

  const result: 'won' | 'lost' | 'draw' | null = useMemo(() => {
    if (!snapshot || !isGameOver) return null;
    if (!snapshot.winnerId || !currentUserId) return 'lost';
    return snapshot.winnerId === currentUserId ? 'won' : 'lost';
  }, [snapshot, isGameOver, currentUserId]);

  const showResultModal =
    !!result && dismissedForSessionId !== (session?.id ?? null);

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
          onLeaveRoom={() => storeLeaveRoom(roomId, currentUserId)}
          onDeleteRoom={() => void storeDeleteRoom(roomId)}
          onKickPlayer={(userId) =>
            storeKickPlayer(roomId, userId, currentUserId ?? '')
          }
          onRefresh={() => void storeRefreshRoom(roomId)}
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
            onPlayCard={handlePlayCard}
            onDraw={draw}
            onCallCascade={callCascade}
          />
        </>
      ) : null}
    </YStack>
  );

  const sharedResult =
    result === 'won' ? 'victory' : result === 'lost' ? 'defeat' : result;
  const resultMessages = result
    ? {
        title:
          result === 'won'
            ? t('games.cascade_v1.gameOver.won')
            : result === 'lost'
              ? t('games.cascade_v1.gameOver.lost')
              : t('games.cascade_v1.gameOver.draw'),
        message:
          result === 'won'
            ? t('games.cascade_v1.gameOver.messages.won')
            : result === 'lost'
              ? t('games.cascade_v1.gameOver.messages.lost')
              : t('games.cascade_v1.gameOver.messages.draw'),
      }
    : undefined;

  const modals = (
    <>
      <GameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={() => setDismissedForSessionId(session?.id ?? null)}
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
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Cascade',
          subtitle: room?.name,
          turnStatusVariant: isGameOver
            ? 'completed'
            : myTurn
              ? 'yourTurn'
              : 'waiting',
          turnStatusText: isGameOver ? 'Game over' : myTurn ? 'Your turn' : '—',
        }}
      />
    </CascadeThemeProvider>
  );
}

export default memo(CascadeGameImpl);
