'use client';

import { memo, useCallback, useMemo } from 'react';
import { GameWidgetContainer, GameEndModals } from '@/features/games/ui';
import {
  useGameChatIntegration,
  useGameChatSend,
  useGameEndState,
  useGameResult,
  useGameRoomActions,
} from '@/features/games/hooks';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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

  const { startSession, rollDice } = useCatDashActions({
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
  useGameChatIntegration(snapshot?.logs, sendChat, resolveDisplayNameBound);

  const { result, resultMessages } = useGameResult({
    session,
    isGameOver,
    currentUserId,
    gameId: 'cat_dash_v1',
    gameOverKey: 'games.cat_dash_v1.gameOver',
    winnerId: snapshot?.winner,
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
    gameId: 'cat_dash_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
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
    <div className="flex flex-col gap-3 items-stretch p-3 w-full">
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
          <div className="flex flex-col gap-2 items-center -mt-2">
            {myTurn && !isGameOver && (
              <button
                type="button"
                disabled={isGameOver}
                onClick={rollDice}
                className="flex flex-row items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-[#7c3aed] transition-colors duration-150 ease-out hover:bg-[#6d28d9] active:bg-[#5b21b6] disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="text-[#f5f7ff] font-bold text-[16px]">
                  🎲 Roll Dice
                </span>
              </button>
            )}
            {isGameOver && snapshot?.winner && (
              <div
                className="flex flex-col items-center gap-2 p-4 bg-[rgba(34,197,94,0.15)] rounded-3xl border-[1.5px] border-[rgba(34,197,94,0.4)]"
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
                <span className="text-[16px] font-bold text-[#22c55e] -mt-1">
                  {resolveDisplayNameBound(snapshot.winner)} wins!
                </span>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );

  const modals = (
    <>
      <GameEndModals
        gameEnd={gameEnd}
        players={[]}
        currentUserId={currentUserId}
        gameName={(() => {
          const raw = t('games.names.catDash' as TranslationKey);
          return raw && raw !== 'games.names.catDash' ? raw : 'Cat Dash';
        })()}
        theme={options.theme}
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
          viewLabel: t('games.table.analytics.view' as TranslationKey),
          backLabel: t('games.table.analytics.back' as TranslationKey),
        }}
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
        theme={options.theme}
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
