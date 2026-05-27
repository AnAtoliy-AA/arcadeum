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

// Widget-only fullscreen CSS — expands just the Critical widget to fill
// the viewport. Independent of the page-level toggle in `GamePageLayout`,
// which expands [control panel + widget + chat] instead.
const criticalWidgetFullscreenStyles = `
  .critical-game-widget.is-fullscreen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    border-width: 0 !important;
    background: #151718 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 1100;
  }
`;

export default function CriticalGame({
  roomId,
  room: initialRoom,
  session: initialSession,
  currentUserId,
  isHost,
  accessToken,
  showRulesOpen,
  onShowRulesClose,
}: CriticalGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  // Widget-only fullscreen. Keyboard shortcut is owned by the page-level
  // `useFullscreen` in `GamePageLayout` (single global listener), so this
  // instance is mouse-only.
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
    startBusy,
    actions,
    reorderParticipants,
    currentPlayer,
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
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
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
    <>
      <style>{criticalWidgetFullscreenStyles}</style>
      <GameContainer
        ref={containerRef as React.RefObject<never>}
        className="critical-game-widget"
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
          actions={actions}
          currentPlayer={currentPlayer}
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
    </>
  );
}
