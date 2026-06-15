'use client';

import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { SeaBattleGameProps } from '../types';
import { MIN_PLAYERS } from '../types';
import { useSeaBattleState } from '../hooks/useSeaBattleState';
import { useSeaBattleActions } from '../hooks/useSeaBattleActions';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useRematch } from '@/features/games/hooks';
import { useGameChatIntegration } from '@/features/games/hooks';
import {
  GameWidgetContainer,
  type TurnStatusVariant,
} from '@/features/games/ui';

import { SeaBattleLobby } from './SeaBattleLobby';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import { getPlayerColor } from '@/shared/lib/playerColors';
import { InGameAvatar } from '@/features/games/ui';

import { SeaBattleModals } from './SeaBattleModals';
import { SeaBattleBoards } from './SeaBattleBoards';

import { RulesModal } from './RulesModal';
import './styles/animations.scss';

export const SeaBattleGame = memo(function SeaBattleGame({
  roomId,
  room: initialRoom,
  currentUserId,
  session: initialSession,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
  isFullscreen: _isFullscreen,
  toggleFullscreen: _toggleFullscreen,
}: SeaBattleGameProps) {
  const { t } = useTranslation();

  const storeRoom = useGameStore((s: GameState) => s.room);
  const storeDeleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const isLobby = room?.status === 'lobby';

  // Rules visibility logic
  const [showRules, setShowRules] = useState(false);
  const [lastIsLobby, setLastIsLobby] = useState(false);

  // Sync showRules with isLobby change (auto-show rules when entering lobby)
  if (isLobby && !lastIsLobby) {
    setLastIsLobby(true);
    setShowRules(true);
  } else if (!isLobby && lastIsLobby) {
    setLastIsLobby(false);
  }

  // Track which session id the result modal has been dismissed for. Using the
  // session id (instead of a plain boolean) means the dismissal naturally
  // resets when a rematch produces a new session, so the next game-over
  // shows the modal again instead of only the win confetti.
  const [dismissedForSessionId, setDismissedForSessionId] = useState<
    string | null
  >(null);

  const {
    startSession,
    placeShip,
    moveShip,
    confirmPlacement,
    attack,
    resetPlacement,
    postHistoryNote: postHistoryNoteAction,
    autoPlace,
  } = useSeaBattleActions({
    roomId,
    userId: currentUserId,
  });

  const handleAutoPlace = useCallback(() => {
    autoPlace();
  }, [autoPlace]);

  const {
    session,
    snapshot,
    startBusy,
    isMyTurn,
    isPlacementPhase,
    isBattlePhase,
    currentPlayer,
    currentTurnPlayer,
    isPlacementComplete,
    isGameOver,
    isWinner,
    teamMode,
    teams,
    viewerTeam,
    winnerTeam,
  } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

  const teammateIds = useMemo(() => {
    if (!viewerTeam || !currentUserId) return undefined;
    return viewerTeam.playerIds.filter((id) => id !== currentUserId);
  }, [viewerTeam, currentUserId]);

  const handleStartGame = useCallback(
    (options?: { withBots?: boolean; botCount?: number }) => {
      if (!room) return;
      const memberCount = room.members?.length || 0;
      if (
        memberCount >= MIN_PLAYERS ||
        (options?.withBots && memberCount >= 1)
      ) {
        startSession(options);
      }
    },
    [room, startSession],
  );

  // Auto-start a rematch with bots: host lands in a fresh lobby whose
  // gameOptions.autoStartWithBots was carried over from the previous game.
  const autoStartedRematchRef = useRef(false);
  const autoStartBotCountRaw = (
    room?.gameOptions as { autoStartWithBots?: unknown } | undefined
  )?.autoStartWithBots;
  const autoStartBotCount =
    typeof autoStartBotCountRaw === 'number' ? autoStartBotCountRaw : 0;
  useEffect(() => {
    if (
      autoStartedRematchRef.current ||
      !isHost ||
      room?.status !== 'lobby' ||
      autoStartBotCount <= 0
    )
      return;
    autoStartedRematchRef.current = true;
    handleStartGame({ withBots: true, botCount: autoStartBotCount });
  }, [isHost, room?.status, autoStartBotCount, handleStartGame]);

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
  );

  // Carry the bot count from the current game into the rematch so the new
  // room can auto-start a fresh game with the same number of bots.
  const previousBotCount = useMemo(
    () =>
      snapshot?.players.filter((p) => p.playerId.startsWith('bot-')).length ??
      0,
    [snapshot?.players],
  );

  const rematchGameOptions = useMemo(
    () => ({
      ...(room?.gameOptions || {}),
      ...(previousBotCount > 0 ? { autoStartWithBots: previousBotCount } : {}),
    }),
    [room?.gameOptions, previousBotCount],
  );

  const {
    rematchLoading,
    showRematchModal,
    openRematchModal,
    closeRematchModal,
    handleRematch,
    invitation,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useRematch({
    roomId,
    gameOptions: rematchGameOptions,
  });

  const handleOpenRematch = useCallback(() => {
    if (session?.id) setDismissedForSessionId(session.id);
    openRematchModal();
  }, [openRematchModal, session?.id]);

  // Non-hosts can request a rematch but can't actually start one — only the
  // host creates the new room. The request posts a public chat note so the
  // host (and everyone else) sees the ask.
  const handleRematchClick = useCallback(() => {
    if (isHost) {
      handleOpenRematch();
      return;
    }
    postHistoryNoteAction('🔁 Wants a rematch!', 'all');
    if (session?.id) setDismissedForSessionId(session.id);
  }, [isHost, handleOpenRematch, postHistoryNoteAction, session?.id]);

  const resultModalDismissed =
    !!session?.id && dismissedForSessionId === session.id;

  const resolveDisplayNameBound = useCallback(
    (id?: string | null, fallback?: string | null) => {
      if (!currentUserId || !room) return fallback || id || '';
      if (id === currentUserId)
        return t('games.sea_battle_v1.table.players.you');

      // Bot ids always get a sequential label, even if the backend
      // stamped them with a placeholder displayName like "Unknown".
      if (id?.startsWith('bot-')) {
        const botOrder =
          snapshot?.playerOrder.filter((pId) => pId.startsWith('bot-')) || [];
        const botIndex = botOrder.indexOf(id);
        if (botIndex !== -1) {
          return `${t('games.lobby.bot' as TranslationKey)} ${botIndex + 1}`;
        }
        return 'Bot';
      }

      const member = room.members?.find((m) => m.id === id);
      if (member?.displayName && member.displayName !== 'Unknown')
        return member.displayName;

      return fallback || id || '';
    },
    [currentUserId, room, t, snapshot],
  );

  const resolveActorColor = useCallback(
    (id?: string | null) => {
      if (!id) return undefined;
      if (teams && teams.length > 0) {
        const team = teams.find((t) => t.playerIds.includes(id));
        if (team?.color) return team.color;
      }
      return getPlayerColor(id);
    },
    [teams],
  );

  // Use shared chat integration hook
  useGameChatIntegration(
    snapshot?.logs,
    postHistoryNoteAction,
    resolveDisplayNameBound,
    resolveActorColor,
  );

  const cardVariant = (room?.gameOptions?.variant ||
    room?.gameOptions?.cardVariant) as string | undefined;

  const getTurnStatus = (): { text: string; variant: TurnStatusVariant } => {
    if (!snapshot) return { text: '', variant: 'default' };
    if (isGameOver)
      return {
        text: t('games.sea_battle_v1.table.phase.completed'),
        variant: 'completed',
      };
    if (isPlacementPhase) {
      return {
        text: isPlacementComplete
          ? t('games.sea_battle_v1.table.actions.waitingForOthers')
          : t('games.sea_battle_v1.table.players.placeShips'),
        variant: isPlacementComplete ? 'waiting' : 'yourTurn',
      };
    }
    if (!currentTurnPlayer) return { text: '', variant: 'default' };
    if (currentTurnPlayer.playerId === currentUserId) {
      return {
        text: t(
          'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
        ).replace('🎯 ', ''),
        variant: 'yourTurn',
      };
    }
    return {
      text: t('games.sea_battle_v1.table.players.waitingFor', {
        player: resolveDisplayNameBound(currentTurnPlayer.playerId, 'opponent'),
      }),
      variant: 'waiting',
    };
  };

  const currentVariant = SEA_BATTLE_VARIANTS.find((v) => v.id === cardVariant);

  const turnStatus = useMemo(
    () => getTurnStatus(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      snapshot,
      isGameOver,
      isPlacementPhase,
      isPlacementComplete,
      currentTurnPlayer,
      currentUserId,
      resolveDisplayNameBound,
    ],
  );

  const gameResult = useMemo(() => {
    if (!isGameOver) return null;
    if (teamMode) {
      return isWinner ? 'victory' : 'defeat';
    }
    if (isWinner || snapshot?.winnerId === currentUserId) return 'victory';
    return 'defeat';
  }, [isGameOver, isWinner, snapshot?.winnerId, currentUserId, teamMode]);

  const headerTitle = useMemo(
    () =>
      currentVariant
        ? `${t('games.sea_battle_v1.name' as TranslationKey)} · ${t(currentVariant.name as TranslationKey)}`
        : t('games.sea_battle_v1.name' as TranslationKey),
    [currentVariant, t],
  );

  const headerProps = useMemo(
    () => ({
      variantEmoji: currentVariant?.emoji ?? '🚢',
      title: headerTitle,
      subtitle: room?.name,
      turnStatusVariant: turnStatus.variant,
      turnStatusText: turnStatus.text,
      turnAvatar: currentTurnPlayer ? (
        <InGameAvatar
          playerId={currentTurnPlayer.playerId}
          name={resolveDisplayNameBound(currentTurnPlayer.playerId, 'opponent')}
          size="icon"
          data-testid="sb-turn-avatar"
        />
      ) : null,
      titleGradient: currentVariant?.gradient,
    }),
    [
      currentVariant,
      headerTitle,
      room?.name,
      turnStatus,
      currentTurnPlayer,
      resolveDisplayNameBound,
    ],
  );

  if (!room) return null;

  // Lobby — early return before GameWidgetContainer
  if (!snapshot) {
    return (
      <SeaBattleThemeProvider variant={cardVariant}>
        <SeaBattleLobby
          room={room}
          isHost={isHost}
          userId={currentUserId ?? undefined}
          startBusy={!!startBusy}
          onStartGame={handleStartGame}
          onReorderPlayers={handleReorderPlayers}
          onShowRules={setShowRules}
          onDeleteRoom={() => storeDeleteRoom(roomId)}
          onKickPlayer={
            currentUserId
              ? (targetUserId) =>
                  storeKickPlayer(roomId, targetUserId, currentUserId)
              : undefined
          }
          onLeaveRoom={
            currentUserId
              ? () => storeLeaveRoom(roomId, currentUserId)
              : undefined
          }
          onRefresh={() => storeRefreshRoom(roomId)}
          t={t}
        />
        <RulesModal
          isOpen={showRules || !!showRulesOpen}
          onClose={() => {
            setShowRules(false);
            onShowRulesClose?.();
          }}
          t={t}
        />
      </SeaBattleThemeProvider>
    );
  }

  // Active game
  return (
    <SeaBattleThemeProvider variant={cardVariant}>
      <GameWidgetContainer
        headerProps={headerProps}
        isGameOver={isGameOver}
        board={
          <SeaBattleBoards
            isPlacementPhase={isPlacementPhase}
            currentPlayer={currentPlayer}
            placeShip={placeShip}
            moveShip={moveShip}
            confirmPlacement={confirmPlacement}
            resetPlacement={resetPlacement}
            isPlacementComplete={isPlacementComplete}
            handleAutoPlace={handleAutoPlace}
            isBattlePhase={isBattlePhase}
            isGameOver={isGameOver}
            teamMode={teamMode}
            winnerTeam={winnerTeam}
            snapshot={snapshot}
            currentUserId={currentUserId}
            currentTurnPlayerId={currentTurnPlayer?.playerId ?? null}
            isMyTurn={isMyTurn}
            attack={attack}
            resolveDisplayNameBound={resolveDisplayNameBound}
            teammateIds={teammateIds}
            teams={teams}
          />
        }
        modals={
          <SeaBattleModals
            showRules={showRules}
            showRulesOpen={showRulesOpen}
            onShowRulesClose={onShowRulesClose}
            setShowRules={setShowRules}
            isGameOver={isGameOver}
            resultModalDismissed={resultModalDismissed}
            gameResult={gameResult}
            handleRematchClick={handleRematchClick}
            session={session}
            setDismissedForSessionId={setDismissedForSessionId}
            rematchLoading={rematchLoading}
            showRematchModal={showRematchModal}
            snapshot={snapshot}
            resolveDisplayNameBound={resolveDisplayNameBound}
            currentUserId={currentUserId}
            closeRematchModal={closeRematchModal}
            handleRematch={handleRematch}
            cardVariant={cardVariant}
            invitation={invitation}
            handleAcceptInvitation={handleAcceptInvitation}
            handleDeclineInvitation={handleDeclineInvitation}
          />
        }
        variant={cardVariant}
        isMyTurn={!!isMyTurn}
      />
    </SeaBattleThemeProvider>
  );
});

export default SeaBattleGame;
