'use client';

import { useRef } from 'react';
import { useGlimwormSocket } from './hooks/useGlimwormSocket';
import { useGlimwormPixi } from './hooks/useGlimwormPixi';
import { useGlimwormControls } from './hooks/useGlimwormControls';
import { GlimwormHud } from './ui/GlimwormHud';
import { GlimwormDeathOverlay } from './ui/GlimwormDeathOverlay';
import { GlimwormLobbyExtras } from './ui/GlimwormLobbyExtras';
import { useGlimwormStore } from './store/glimwormStore';
import type { BaseGameWidgetProps } from '@/features/games/types/base';
import type { GlimwormVariant } from './types';

const DEFAULT_VARIANT: GlimwormVariant = 'battle_royale';

function readVariantFromRoom(
  room: BaseGameWidgetProps['room'],
): GlimwormVariant {
  const opts = room.gameOptions as { variant?: string } | undefined;
  const v = opts?.variant;
  if (v === 'battle_royale' || v === 'time_attack' || v === 'lives_heats') {
    return v;
  }
  return DEFAULT_VARIANT;
}

function readPowerupsFromRoom(room: BaseGameWidgetProps['room']): boolean {
  const opts = room.gameOptions as { powerupsEnabled?: boolean } | undefined;
  return opts?.powerupsEnabled === true;
}

export default function GlimwormGame(
  props: BaseGameWidgetProps,
): React.JSX.Element {
  const { roomId, currentUserId, room } = props;
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useGlimwormSocket({ roomId, userId: currentUserId });
  const { getHeadScreenPos } = useGlimwormPixi(canvasRef);
  useGlimwormControls({ canvasRef, getHeadScreenPos });

  const snapshotStatus = useGlimwormStore(
    (s) => s.latestSnapshot?.status ?? 'lobby',
  );
  const isLobby = snapshotStatus === 'lobby' || room.status === 'lobby';
  const variant = readVariantFromRoom(room);
  const powerupsEnabled = readPowerupsFromRoom(room);

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
            width: 280,
            zIndex: 1,
          }}
        >
          <GlimwormLobbyExtras
            roomId={roomId}
            userId={currentUserId}
            variant={variant}
            powerupsEnabled={powerupsEnabled}
          />
        </div>
      )}
      {!isLobby && (
        <>
          <GlimwormHud />
          <GlimwormDeathOverlay />
        </>
      )}
    </div>
  );
}
