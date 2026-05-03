'use client';

import { useEffect, useRef } from 'react';
import { useGlimwormSocket } from './hooks/useGlimwormSocket';
import { useGlimwormPixi } from './hooks/useGlimwormPixi';
import { useGlimwormControls } from './hooks/useGlimwormControls';
import { GlimwormHud } from './ui/GlimwormHud';
import { GlimwormDeathOverlay } from './ui/GlimwormDeathOverlay';
import { GlimwormLobby } from './ui/GlimwormLobby';
import { useGlimwormStore } from './store/glimwormStore';
import { gameSocket } from '@/shared/lib/socket';
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export default function GlimwormGame(
  props: BaseGameWidgetProps,
): React.JSX.Element {
  const { roomId, currentUserId, isHost, room } = props;
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useGlimwormSocket({ roomId, userId: currentUserId });
  const { getHeadScreenPos } = useGlimwormPixi(canvasRef);
  useGlimwormControls({ canvasRef, getHeadScreenPos });

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
  // Treat 'lobby' AND 'countdown' as lobby for UI purposes.
  const effectiveStatus = snapshotStatus ?? room.status;
  const isLobby =
    effectiveStatus === 'lobby' || effectiveStatus === 'countdown';

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
      <GlimwormHud />
      <GlimwormDeathOverlay />
      {isHost && currentUserId && (
        <button
          type="button"
          onClick={() => {
            gameSocket.emit('glimworm.restart', {
              roomId,
              userId: currentUserId,
            });
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            padding: '8px 14px',
            borderRadius: 6,
            background: 'rgba(177,94,255,0.85)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          ↻ Restart
        </button>
      )}
    </div>
  );
}
