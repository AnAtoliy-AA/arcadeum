import React, { useRef } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalGameProps } from '../types';
import { useCriticalState, useRematch } from '../hooks';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import { CriticalLobby } from './CriticalLobby';
import { ActiveGameView } from './ActiveGameView';
import { GameContainer } from './styles';
import type { GameVariant } from '@arcadeum/ui';

export default function CriticalGame({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  isFullscreen: pageLevelFullscreen,
  toggleFullscreen: pageLevelToggleFullscreen,
  showRulesOpen,
  onShowRulesClose,
}: CriticalGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const storeRoom = useGameStore((s: GameState) => s.room);
  const storeDeleteRoom = useGameStore((s: GameState) => s.deleteRoom);
  const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
  const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
  const storeRefreshRoom = useGameStore((s: GameState) => s.refreshRoom);

  const room =
    (storeRoom?.id === roomId ? storeRoom : null) || initialRoom || null;

  const cardVariant = room?.gameOptions?.cardVariant;

  const {
    snapshot,
    actionBusy,
    startBusy,
    actions,
    reorderParticipants,
    currentPlayer,
    currentTurnPlayer,
    isMyTurn,
    canAct,
    canPlayNope,
    aliveOpponents,
    isGameOver,
  } = useCriticalState({
    roomId,
    currentUserId,
    initialSession,
    accessToken,
  });

  const rematch = useRematch({ roomId, gameOptions: room?.gameOptions });

  if (!room) return null;

  // Game not started yet - show Lobby
  if (!snapshot) {
    return (
      <CriticalLobby
        room={room}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={pageLevelFullscreen}
        onToggleFullscreen={pageLevelToggleFullscreen}
        onStartGame={actions.startCritical}
        onReorderPlayers={reorderParticipants}
        onReinvite={rematch.handleReinvite}
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
    );
  }

  // Game in progress - show Active Game View
  return (
    <GameContainer
      ref={containerRef as React.RefObject<never>}
      isFullscreen={isFullscreen}
      $isMyTurn={!!isMyTurn}
      $variant={cardVariant as GameVariant}
    >
      <ActiveGameView
        currentUserId={currentUserId}
        room={room}
        snapshot={snapshot}
        isHost={isHost}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        actionBusy={actionBusy}
        actions={actions}
        currentPlayer={currentPlayer}
        currentTurnPlayer={currentTurnPlayer ?? undefined}
        isMyTurn={!!isMyTurn}
        canAct={!!canAct}
        canPlayNope={!!canPlayNope}
        aliveOpponents={aliveOpponents}
        isGameOver={!!isGameOver}
        rematch={rematch}
        showRulesOpen={showRulesOpen}
        onShowRulesClose={onShowRulesClose}
      />
    </GameContainer>
  );
}
