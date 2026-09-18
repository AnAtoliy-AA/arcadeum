'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { GameWidgetContainer } from '@/features/games/ui/GameWidgetContainer';
import { GameEndModals } from '@/features/games/ui/GameEndModals';
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
} from '@/shared/i18n/useTranslation';
import { useGameSound } from '@/shared/lib/game-sounds';
import type { CatDashGameProps } from '../types';
import { useCatDashState } from '../hooks/useCatDashState';
import { useCatDashActions } from '../hooks/useCatDashActions';
import { CatDashThemeProvider } from '../lib/CatDashThemeContext';
import { CatDashLobby } from './Lobby';
import { CatDashBoard } from './Board';
import { RealisticCat } from './RealisticCat';
import { CatDashTurnBadge } from './TurnBadge';
import { CatDashDashboard } from './CatDashDashboard';
import { CatDashRulesModal } from './RulesModal';
import { RacerBioModal } from './RacerBioModal';
import { CAT_DASH_THEMES } from '../lib/constants';
import type { CatDashOptions, CatDashTheme, CatId } from '../types';

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

  const { startSession, rollDice, activateAbility } = useCatDashActions({
    roomId,
    userId: currentUserId,
  });

  const [rollingTurn, setRollingTurn] = useState<number | null>(null);
  const [inspectedCatId, setInspectedCatId] = useState<CatId | null>(null);
  const isRolling =
    rollingTurn !== null &&
    rollingTurn === snapshot?.turnNumber &&
    Boolean(myTurn) &&
    !isGameOver;

  const { play } = useGameSound('cat_dash_v1');

  const handleRollDice = useCallback(() => {
    setRollingTurn(snapshot?.turnNumber ?? 0);
    play('roll');
    rollDice();
  }, [rollDice, play, snapshot?.turnNumber]);

  const handleUseAbility = useCallback(
    (abilityId: string) => {
      play('confirm');
      activateAbility(abilityId);
    },
    [activateAbility, play],
  );

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
      CAT_DASH_THEMES.find((v) => v.id === options.theme) ?? CAT_DASH_THEMES[0],
    [options.theme],
  );

  if (!room) return null;

  if (isLobby) {
    return (
      <CatDashThemeProvider variant={options.theme as CatDashTheme}>
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
    <div className="flex flex-col gap-4 items-stretch p-3 w-full max-w-5xl mx-auto">
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
          {isGameOver && snapshot?.winner && (
            <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/15 rounded-3xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 backdrop-blur-md max-w-md mx-auto">
              <RealisticCat
                catId={
                  snapshot.players.find((p) => p.playerId === snapshot.winner)
                    ?.catId ?? 'neon'
                }
                size={72}
                variant="card"
                showGlow={true}
              />
              <span className="text-lg font-extrabold text-emerald-400">
                {resolveDisplayNameBound(snapshot.winner)} wins!
              </span>
            </div>
          )}
          <CatDashDashboard
            snapshot={snapshot}
            currentUserId={currentUserId}
            myTurn={myTurn}
            isGameOver={isGameOver}
            isRolling={isRolling}
            onRollDice={handleRollDice}
            resolveName={resolveDisplayNameBound}
            onInspectCat={setInspectedCatId}
            onUseAbility={handleUseAbility}
          />
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
      {inspectedCatId && (
        <RacerBioModal
          open={Boolean(inspectedCatId)}
          onClose={() => setInspectedCatId(null)}
          initialCatId={inspectedCatId}
        />
      )}
    </>
  );

  return (
    <CatDashThemeProvider variant={options.theme as CatDashTheme}>
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
