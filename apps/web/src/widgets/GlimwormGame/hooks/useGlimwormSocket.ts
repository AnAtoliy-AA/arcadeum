'use client';

import { useEffect, useRef } from 'react';
import { gameSocket, emitEncrypted } from '@/shared/lib/socket';
import { useGlimwormStore } from '../store/glimwormStore';
import type {
  GlimwormDiscreteEvent,
  GlimwormInputPayload,
  GlimwormSnapshot,
} from '../types';

const INPUT_HZ = 20;
const INPUT_INTERVAL_MS = 1000 / INPUT_HZ;

interface UseGlimwormSocketOptions {
  roomId: string | null;
  userId: string | null;
}

/**
 * Bridge between the Glimworm Zustand store and the shared `gameSocket`.
 * - Emits the latest `localInput` at 20Hz while in a room.
 * - Ingests snapshots and discrete events into the store.
 * - Updates `connectionStatus` from socket connect/disconnect events.
 */
export function useGlimwormSocket(opts: UseGlimwormSocketOptions): void {
  const { roomId, userId } = opts;
  const lastEmittedRef = useRef<{ angle: number; usePowerup: boolean } | null>(
    null,
  );

  // Snapshot listener
  useEffect(() => {
    const handler = (raw: unknown) => {
      const snap = raw as GlimwormSnapshot;
      useGlimwormStore.getState().ingestSnapshot(snap);
    };
    gameSocket.on('glimworm.snapshot', handler);
    return () => {
      gameSocket.off('glimworm.snapshot', handler);
    };
  }, []);

  // Discrete event listener
  useEffect(() => {
    const handler = (raw: unknown) => {
      const ev = raw as GlimwormDiscreteEvent;
      useGlimwormStore.getState().pushEvent(ev);
    };
    gameSocket.on('glimworm.event', handler);
    return () => {
      gameSocket.off('glimworm.event', handler);
    };
  }, []);

  // Connection status
  useEffect(() => {
    const setStatus = useGlimwormStore.getState().setStatus;
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('reconnecting');
    gameSocket.on('connect', onConnect);
    gameSocket.on('disconnect', onDisconnect);
    if (gameSocket.connected) setStatus('connected');
    return () => {
      gameSocket.off('connect', onConnect);
      gameSocket.off('disconnect', onDisconnect);
    };
  }, []);

  // 20Hz input emit loop
  useEffect(() => {
    if (!roomId || !userId) return;
    const interval = setInterval(() => {
      const { localInput } = useGlimwormStore.getState();
      const last = lastEmittedRef.current;
      if (
        last &&
        last.angle === localInput.angle &&
        last.usePowerup === localInput.usePowerup
      ) {
        return;
      }
      lastEmittedRef.current = { ...localInput };
      const payload: GlimwormInputPayload = {
        angle: localInput.angle,
        usePowerup: localInput.usePowerup,
      };
      void emitEncrypted(gameSocket, 'glimworm.input', {
        roomId,
        userId,
        ...payload,
      });
      // usePowerup is one-shot — clear it after emission.
      if (localInput.usePowerup) {
        useGlimwormStore.getState().setInput({
          angle: localInput.angle,
          usePowerup: false,
        });
      }
    }, INPUT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [roomId, userId]);
}
