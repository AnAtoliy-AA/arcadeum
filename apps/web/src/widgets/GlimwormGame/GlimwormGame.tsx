'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGlimwormSocket } from './hooks/useGlimwormSocket';
import { useGlimwormPixi } from './hooks/useGlimwormPixi';
import { useGlimwormControls } from './hooks/useGlimwormControls';
import { GlimwormHud } from './ui/GlimwormHud';
import { GlimwormDeathOverlay } from './ui/GlimwormDeathOverlay';
import { GlimwormLobby } from './ui/GlimwormLobby';
import { GlimwormCountdown } from './ui/GlimwormCountdown';
import { GlimwormControlsHint } from './ui/GlimwormControlsHint';
import { GlimwormResultOverlay } from './ui/GlimwormResultOverlay';
import { useGlimwormStore } from './store/glimwormStore';
import { gameSocket } from '@/shared/lib/socket';
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export default function GlimwormGame(
  props: BaseGameWidgetProps,
): React.JSX.Element {
  const { roomId, currentUserId, isHost, room } = props;

  // State-backed callback ref: when the canvas div is mounted (after the
  // lobby branch ends), `setCanvasEl` flips the state and the pixi/controls
  // hooks' effects re-run with a real DOM node. A plain ref wouldn't work
  // here because its identity doesn't change across the lobby→playing flip.
  const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);
  const canvasRef = useCallback((el: HTMLDivElement | null) => {
    setCanvasEl(el);
  }, []);

  useGlimwormSocket({ roomId, userId: currentUserId });
  const { getHeadScreenPos } = useGlimwormPixi(canvasEl);
  useGlimwormControls({ canvasEl, getHeadScreenPos });

  // Auto-join Glimworm session on mount so the BE knows about this player.
  useEffect(() => {
    if (!currentUserId) return;
    gameSocket.emit('glimworm.join', {
      roomId,
      userId: currentUserId,
    });
  }, [roomId, currentUserId]);

  const snapshotStatus = useGlimwormStore(
    (s) => s.latestSnapshot?.status ?? null,
  );
  // Use the live snapshot when present; otherwise fall back to room.status.
  // 'lobby' shows the lobby; 'countdown' / 'playing' / 'ended' show the canvas.
  const effectiveStatus = snapshotStatus ?? room.status;
  const isLobby = effectiveStatus === 'lobby';
  const isCountdown = effectiveStatus === 'countdown';
  const isEnded = effectiveStatus === 'ended';

  // Restart = drop back to lobby (host can change settings before next start).
  const handleRestart = useCallback(() => {
    if (!currentUserId) return;
    gameSocket.emit('glimworm.restart', {
      roomId,
      userId: currentUserId,
    });
  }, [roomId, currentUserId]);

  // Rematch = one-click new round with the same options as last time.
  const handleRematch = useCallback(() => {
    if (!currentUserId) return;
    gameSocket.emit('glimworm.rematch', {
      roomId,
      userId: currentUserId,
    });
  }, [roomId, currentUserId]);

  if (isLobby && currentUserId) {
    return (
      <GlimwormLobby
        room={room}
        isHost={isHost}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 480,
      }}
    >
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#06070d',
        }}
      />
      <GlimwormHud isHost={isHost} onRestart={handleRestart} />
      <GlimwormDeathOverlay />
      {isCountdown && <GlimwormCountdown />}
      {!isCountdown && !isEnded && <GlimwormControlsHint />}
      {isEnded && (
        <GlimwormResultOverlay
          isHost={isHost}
          onRematch={handleRematch}
          onLobby={handleRestart}
        />
      )}
    </div>
  );
}
