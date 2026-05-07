'use client';

import { useCallback, useState, useMemo, memo } from 'react';
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
  GameResultModal,
  RematchModal,
  RematchInvitationModal,
  GameWidgetContainer,
  type TurnStatusVariant,
} from '@/features/games/ui';

import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import { SeaBattleLobby } from './SeaBattleLobby';
import { SeaBattleTable } from './SeaBattleTable';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import { Card, Typography } from '@arcadeum/ui';

import { RulesModal } from './RulesModal';
import { useSeaBattleAnimations } from './styles/animations';

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
  useSeaBattleAnimations();

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

  const [resultModalDismissed, setResultModalDismissed] = useState(false);

  const {
    startSession,
    placeShip,
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
    activeShooterId,
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

  // Use shared chat integration hook
  useGameChatIntegration(snapshot?.logs, postHistoryNoteAction);

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

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !roomId) return;
      try {
        await reorderRoomParticipants(roomId, newOrder, accessToken);
      } catch {}
    },
    [roomId, accessToken],
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
    gameOptions: room?.gameOptions,
  });

  const handleOpenRematch = useCallback(() => {
    setResultModalDismissed(true);
    openRematchModal();
  }, [openRematchModal, setResultModalDismissed]);

  const resolveDisplayNameBound = useCallback(
    (id?: string | null, fallback?: string | null) => {
      if (!currentUserId || !room) return fallback || id || '';
      if (id === currentUserId)
        return t('games.sea_battle_v1.table.players.you');
      const member = room.members?.find((m) => m.id === id);
      return member?.displayName || fallback || id || '';
    },
    [currentUserId, room, t],
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
      titleGradient: currentVariant?.gradient,
    }),
    [currentVariant, headerTitle, room?.name, turnStatus],
  );

  const boardContent = useMemo(
    () => (
      <>
        {isPlacementPhase && (
          <ShipPlacementBoard
            key="placement-board"
            currentPlayer={currentPlayer}
            onPlaceShip={placeShip}
            onConfirmPlacement={confirmPlacement}
            onResetPlacement={resetPlacement}
            isPlacementComplete={isPlacementComplete}
            onAutoPlace={handleAutoPlace}
          />
        )}

        {isBattlePhase && teamMode && snapshot && teams && (
          <SeaBattleTable
            key="team-roster"
            players={snapshot.players}
            currentUserId={currentUserId}
            currentTurnIndex={snapshot.currentTurnIndex}
            playerOrder={snapshot.playerOrder}
            resolveDisplayName={resolveDisplayNameBound}
            teams={teams}
            activeShooterId={activeShooterId}
          />
        )}

        {isBattlePhase && currentPlayer && !currentPlayer.alive && (
          <Card
            variant="error"
            padding="md"
            marginHorizontal="$3"
            marginBottom="$3"
          >
            <Typography>
              {t(
                'games.sea_battle_v1.teamMode.banner.eliminatedSpectator' as TranslationKey,
              )}
            </Typography>
          </Card>
        )}

        {isGameOver && teamMode && winnerTeam && (
          <Card
            variant="elevated"
            padding="md"
            marginHorizontal="$3"
            marginBottom="$3"
          >
            <Typography>
              {t(
                'games.sea_battle_v1.teamMode.banner.teamWon' as TranslationKey,
                { team: winnerTeam.name },
              )}
            </Typography>
          </Card>
        )}

        {isBattlePhase && snapshot && (
          <AttackBoard
            key="attack-board"
            players={snapshot.players}
            currentUserId={currentUserId}
            isMyTurn={isMyTurn}
            onAttack={attack}
            resolveDisplayName={resolveDisplayNameBound}
            teammateIds={teammateIds}
          />
        )}
      </>
    ),
    [
      isPlacementPhase,
      currentPlayer,
      placeShip,
      confirmPlacement,
      resetPlacement,
      isPlacementComplete,
      handleAutoPlace,
      isBattlePhase,
      currentUserId,
      isMyTurn,
      attack,
      resolveDisplayNameBound,
      snapshot,
      teammateIds,
      isGameOver,
      teamMode,
      teams,
      activeShooterId,
      winnerTeam,
      t,
    ],
  );

  const modalsContent = useMemo(
    () => (
      <>
        <RulesModal
          isOpen={showRules || !!showRulesOpen}
          onClose={() => {
            setShowRules(false);
            onShowRulesClose?.();
          }}
          t={t}
        />
        <GameResultModal
          isOpen={isGameOver && !resultModalDismissed}
          result={gameResult}
          onRematch={isHost ? handleOpenRematch : undefined}
          onClose={() => setResultModalDismissed(true)}
          rematchLoading={rematchLoading}
          t={t}
        />

        <RematchModal
          isOpen={showRematchModal}
          players={
            snapshot?.players.map((p) => ({
              playerId: p.playerId,
              displayName: resolveDisplayNameBound(
                p.playerId,
                `Player ${p.playerId.slice(0, 4)} `,
              ),
              alive: p.alive,
            })) || []
          }
          currentUserId={currentUserId}
          rematchLoading={rematchLoading}
          onClose={closeRematchModal}
          onConfirm={handleRematch}
          t={t}
          cardVariant={cardVariant}
        />

        <RematchInvitationModal
          isOpen={!!invitation}
          senderName={invitation?.hostName || ''}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
          t={t}
        />
      </>
    ),
    [
      showRules,
      showRulesOpen,
      onShowRulesClose,
      t,
      isGameOver,
      resultModalDismissed,
      gameResult,
      isHost,
      handleOpenRematch,
      rematchLoading,
      showRematchModal,
      snapshot?.players,
      resolveDisplayNameBound,
      currentUserId,
      closeRematchModal,
      handleRematch,
      cardVariant,
      invitation,
      handleAcceptInvitation,
      handleDeclineInvitation,
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
        board={boardContent}
        modals={modalsContent}
        variant={cardVariant}
        isMyTurn={!!isMyTurn}
      />
    </SeaBattleThemeProvider>
  );
});

export default SeaBattleGame;
