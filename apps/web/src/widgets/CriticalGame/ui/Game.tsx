import React, { useRef } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalGameProps } from '../types';
import { useCriticalState, useFullscreen, useRematch } from '../hooks';
import { useGameStore } from '@/features/games/store/gameStore';
import { CriticalLobby } from './CriticalLobby';
import { ActiveGameView } from './ActiveGameView';
import { GameContainer } from './styles';

export default function CriticalGame({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
}: CriticalGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const storeRoom = useGameStore((s) => s.room);
  const storeDeleteRoom = useGameStore((s) => s.deleteRoom);

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

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const rematch = useRematch({ roomId, gameOptions: room?.gameOptions });

  if (!room) return null;

  // Game not started yet - show Lobby
  if (!snapshot) {
    return (
      <CriticalLobby
        room={room}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={isFullscreen}
        containerRef={containerRef}
        onToggleFullscreen={toggleFullscreen}
        onStartGame={actions.startCritical}
        onReorderPlayers={reorderParticipants}
        onReinvite={rematch.handleReinvite}
        onDeleteRoom={() => storeDeleteRoom(roomId)}
        t={t as (key: string) => string}
      />
    );
  }

  // Game in progress - show Active Game View
  return (
    <GameContainer
      ref={containerRef}
      $isMyTurn={!!isMyTurn}
      $variant={cardVariant}
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
      />
    </GameContainer>
  );
}
