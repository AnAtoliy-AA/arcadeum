'use client';

import { memo, useCallback, useMemo } from 'react';
import { YStack } from 'tamagui';
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
          <CatDashBoard snapshot={snapshot} disabled={!myTurn || isGameOver} />
          <YStack gap="$2" alignItems="center" marginTop="$2">
            {myTurn && !isGameOver && (
              <YStack gap="$2" alignItems="center">
                <CatDashTurnButton
                  disabled={!myTurn || isGameOver}
                  onPress={rollDice}
                  label="🎲 Roll Dice"
                />
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

function CatDashTurnButton({
  disabled,
  onPress,
  label,
}: {
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onPress}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: disabled ? '#6b7280' : '#7c3aed',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

export default memo(CatDashGameImpl);
