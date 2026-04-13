'use client';

import { useCallback, useState, useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { SeaBattleGameProps, SeaBattleSnapshot } from '../types';
import { MIN_PLAYERS } from '../types';
import { useSeaBattleState } from '../hooks/useSeaBattleState';
import { useSeaBattleActions } from '../hooks/useSeaBattleActions';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useDisplayNames } from '@/widgets/CriticalGame/lib/displayUtils';
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
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';

import { RulesModal } from './RulesModal';
import { useSeaBattleAnimations } from './styles/animations';

export default function SeaBattleGame({
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
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const isLobby = room?.status === 'lobby';

  const [showRules, setShowRules] = useState(isLobby);
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
  } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

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

  const { isWinner } = useSeaBattleState({
    roomId,
    currentUserId,
    initialSession,
    room: room ?? undefined,
  });

  const { resolveDisplayName } = useDisplayNames({
    currentUserId,
    room: room!,
    snapshot: snapshot as SeaBattleSnapshot,
    youLabel: t('games.sea_battle_v1.table.players.you'),
    translateCardType: () => '',
    seeTheFutureLabel: '',
  });

  const cardVariant = (room?.gameOptions?.variant ||
    room?.gameOptions?.cardVariant) as string | undefined;

  const currentVariant = SEA_BATTLE_VARIANTS.find((v) => v.id === cardVariant);

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
        player: resolveDisplayName(currentTurnPlayer.playerId, 'opponent'),
      }),
      variant: 'waiting',
    };
  };

  const turnStatus = getTurnStatus();

  const headerTitle = currentVariant
    ? `${t('games.sea_battle_v1.name' as TranslationKey)} · ${t(currentVariant.name as TranslationKey)}`
    : t('games.sea_battle_v1.name' as TranslationKey);

  const gameResult = useMemo(() => {
    if (!isGameOver) return null;
    if (isWinner || snapshot?.winnerId === currentUserId) return 'victory';
    return 'defeat';
  }, [isGameOver, isWinner, snapshot?.winnerId, currentUserId]);

  if (!room) return null;

  // Lobby — early return before GameWidgetContainer
  if (!snapshot) {
    return (
      <SeaBattleThemeProvider variant={cardVariant}>
        <SeaBattleLobby
          room={room}
          isHost={isHost}
          startBusy={!!startBusy}
          onStartGame={handleStartGame}
          onReorderPlayers={handleReorderPlayers}
          onShowRules={setShowRules}
          onDeleteRoom={() => storeDeleteRoom(roomId)}
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
        headerProps={{
          variantEmoji: currentVariant?.emoji ?? '🚢',
          title: headerTitle,
          subtitle: room?.name,
          turnStatusVariant: turnStatus.variant,
          turnStatusText: turnStatus.text,
          titleGradient: currentVariant?.gradient,
        }}
        board={
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

            {isBattlePhase && (
              <AttackBoard
                key="attack-board"
                players={snapshot.players}
                currentUserId={currentUserId}
                isMyTurn={isMyTurn}
                onAttack={attack}
                resolveDisplayName={resolveDisplayName}
              />
            )}
          </>
        }
        modals={
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
                  displayName: resolveDisplayName(
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
        }
        variant={cardVariant}
        isMyTurn={!!isMyTurn}
      />
    </SeaBattleThemeProvider>
  );
}
