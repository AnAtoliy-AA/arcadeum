'use client';

import { useEffect, useRef } from 'react';
import { useGlimwormSocket } from './hooks/useGlimwormSocket';
import { useGlimwormPixi } from './hooks/useGlimwormPixi';
import { useGlimwormControls } from './hooks/useGlimwormControls';
import { GlimwormHud } from './ui/GlimwormHud';
import { GlimwormDeathOverlay } from './ui/GlimwormDeathOverlay';
import { GlimwormLobbyExtras } from './ui/GlimwormLobbyExtras';
import { useGlimwormStore } from './store/glimwormStore';
import { gameSocket } from '@/shared/lib/socket';
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export default function GlimwormGame(
  props: BaseGameWidgetProps,
): React.JSX.Element {
  const { roomId, currentUserId, isHost } = props;
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
    (s) => s.latestSnapshot?.status ?? 'lobby',
  );
  const isLobby = snapshotStatus === 'lobby' || snapshotStatus === 'countdown';

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
      {isLobby && currentUserId && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 320,
            zIndex: 1,
          }}
        >
          <GlimwormLobbyExtras
            roomId={roomId}
            userId={currentUserId}
            isHost={isHost}
          />
        </div>
      )}
      {!isLobby && (
        <>
          <GlimwormHud />
          <GlimwormDeathOverlay />
        </>
      )}
      {isHost && currentUserId && !isLobby && (
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
