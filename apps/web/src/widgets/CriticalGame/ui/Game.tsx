import { useRef } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalGameProps } from '../types';
import { useCriticalState, useRematch } from '../hooks';
import { useGameRoomActions } from '@/features/games/hooks';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import { CriticalLobby } from './CriticalLobby';
import { ActiveGameView } from './ActiveGameView';

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
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const { room, onDeleteRoom, onKickPlayer, onLeaveRoom, onRefresh } =
    useGameRoomActions(roomId, initialRoom);

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
        userId={currentUserId ?? ''}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onStartGame={actions.startCritical}
        onReorderPlayers={reorderParticipants}
        onReinvite={rematch.handleReinvite}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={
          currentUserId
            ? (targetUserId) => onKickPlayer(targetUserId, currentUserId)
            : undefined
        }
        onLeaveRoom={
          currentUserId ? () => onLeaveRoom(currentUserId) : undefined
        }
        onRefresh={onRefresh}
        t={t}
      />
    );
  }

  // Game in progress — the active view renders inside the shared
  // GameWidgetContainer (header with turn+avatar, widget fullscreen, chat
  // popup, my-turn border), so Critical no longer wraps its own container or
  // runs a second fullscreen system here.
  return (
    <ActiveGameView
      currentUserId={currentUserId}
      room={room}
      snapshot={snapshot}
      isHost={isHost}
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
  );
}
