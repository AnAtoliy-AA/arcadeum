'use client';

import { memo, useCallback, useMemo } from 'react';
import { YStack, Button, Text } from 'tamagui';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameEndState,
  useGameRoomActions,
} from '@/features/games/hooks';
import { computeGameResult } from '@/features/games/lib/computeGameResult';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { useRecordGameResult } from '@/features/stats/hooks/useRecordGameResult';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CatDashGameProps } from '../types';
import { useCatDashState } from '../hooks/useCatDashState';
import { useCatDashActions } from '../hooks/useCatDashActions';
import { CatDashThemeProvider } from '../lib/CatDashThemeContext';
import { CatDashLobby } from './Lobby';
import { CatDashBoard } from './Board';
import { RealisticCat } from './RealisticCat';
import { CatDashTurnBadge } from './TurnBadge';
import { CatDashRulesModal } from './RulesModal';
import { CAT_DASH_VARIANTS } from '../lib/constants';
import type { CatDashOptions, CatDashVariant } from '../types';

function resolveOptions(raw: unknown): CatDashOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    trackType: string;
    theme: string;
  }>;
  return {
    trackType: (r.trackType ?? 'linear') as CatDashOptions['trackType'],
    theme: (r.theme ?? 'village') as CatDashOptions['theme'],
  };
}

function CatDashGameImpl({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  showRulesOpen,
  onShowRulesClose,
}: CatDashGameProps) {
  const { t } = useTranslation();
  const { room, onLeaveRoom, onDeleteRoom, onKickPlayer, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

  const isLobby = room?.status === 'lobby';

  const { snapshot, currentEntryId, myTurn, isGameOver, startBusy, session } =
    useCatDashState({
      roomId,
      currentUserId,
      initialSession,
    });

  const {
    startSession,
    rollDice,
    useAbility: _useAbility,
    choosePath: _choosePath,
  } = useCatDashActions({
    roomId,
    userId: currentUserId,
  });

  const resolveDisplayNameBound = useCallback(
    (id?: string | null) =>
      resolveDisplayName(id, {
        currentUserId,
        members: room?.members,
        playerOrder: snapshot?.players.map((p) => p.playerId),
      }),
    [currentUserId, room, snapshot],
  );

  const sendChat = useGameChatSend(roomId, currentUserId, 'cat_dash_v1');
  useGameChatIntegration(
    snapshot?.logs as never,
    sendChat,
    resolveDisplayNameBound,
  );

  const result = computeGameResult(isGameOver, currentUserId, {
    winnerId: snapshot?.winner,
    backendResult: (session?.state as Record<string, unknown>)?.gameResult as
      | import('@/features/games/lib/computeGameResult').BackendGameResult
      | undefined,
  });

  useRecordGameResult(result, 'cat_dash_v1', session?.id);

  const gameEnd = useGameEndState({
    roomId,
    currentUserId,
    session,
    isGameOver,
    result,
    resultMessages: result
      ? {
          title: t(
            `games.cat_dash_v1.gameOver.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}` as never,
          ),
          message: t(
            `games.cat_dash_v1.gameOver.messages.${result === 'won' ? 'won' : result === 'lost' ? 'lost' : 'draw'}` as never,
          ),
        }
      : undefined,
  });

  const options = useMemo(
    () => resolveOptions(room?.gameOptions),
    [room?.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      CAT_DASH_VARIANTS.find((v) => v.id === options.theme) ??
      CAT_DASH_VARIANTS[0],
    [options.theme],
  );

  if (!room) return null;

  if (isLobby) {
    return (
      <CatDashThemeProvider variant={options.theme as CatDashVariant}>
        <CatDashLobby
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
      </CatDashThemeProvider>
    );
  }

  const board = (
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
      {snapshot ? (
        <>
          <CatDashTurnBadge
            snapshot={snapshot}
            currentEntryId={currentEntryId}
            myTurn={myTurn}
            resolveName={resolveDisplayNameBound}
          />
          <CatDashBoard
            snapshot={snapshot}
            disabled={!myTurn || isGameOver}
            resolveName={resolveDisplayNameBound}
          />
          <YStack gap="$2" alignItems="center" marginTop="$2">
            {myTurn && !isGameOver && (
              <Button
                size="$5"
                backgroundColor="#7c3aed"
                hoverStyle={{ backgroundColor: '#6d28d9' }}
                pressStyle={{ backgroundColor: '#5b21b6' }}
                disabled={isGameOver}
                onPress={rollDice}
                borderRadius="$4"
              >
                <Text color="white" fontWeight="bold" fontSize={16}>
                  🎲 Roll Dice
                </Text>
              </Button>
            )}
            {isGameOver && snapshot?.winner && (
              <YStack
                alignItems="center"
                gap="$2"
                padding="$4"
                backgroundColor="rgba(34,197,94,0.15)"
                borderRadius="$5"
                borderWidth={1.5}
                borderColor="rgba(34,197,94,0.4)"
                style={{
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <RealisticCat
                  catId={
                    snapshot.players.find((p) => p.playerId === snapshot.winner)
                      ?.catId ?? 'neon'
                  }
                  size={48}
                />
                <Text
                  fontSize={16}
                  fontWeight="bold"
                  color="#22c55e"
                  marginTop="$1"
                >
                  {resolveDisplayNameBound(snapshot.winner)} wins!
                </Text>
              </YStack>
            )}
          </YStack>
        </>
      ) : null}
    </YStack>
  );

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={[]}
        currentUserId={currentUserId}
        t={t}
      />
      <CatDashRulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
      />
    </>
  );

  return (
    <CatDashThemeProvider variant={options.theme as CatDashVariant}>
      <GameWidgetContainer
        board={board}
        modals={modals}
        variant={options.theme}
        isMyTurn={myTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantTokens.emoji,
          title: 'Cat Dash',
          subtitle: room?.name,
          turn: {
            onClockUserId: currentEntryId,
            isMyTurn: myTurn,
            isGameOver,
          },
        }}
      />
    </CatDashThemeProvider>
  );
}

export default memo(CatDashGameImpl);
