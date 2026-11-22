'use client';

import { useEffect, useState } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { useGlimwormStore } from '../store/glimwormStore';
import type { GlimwormVariant } from '../types';

export function useGlimwormLobbyState(roomId: string, currentUserId: string) {
  const selectedColor = useGlimwormStore((s) => s.selectedColor);
  const setColor = useGlimwormStore((s) => s.setColor);
  const latestSnapshot = useGlimwormStore((s) => s.latestSnapshot);

  const [variant, setVariant] = useState<GlimwormVariant>('battle_royale');
  const [powerupsEnabled, setPowerupsEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowedVariants, setAllowedVariants] = useState<
    CatalogVariant[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
        setAllowedVariants(glim?.variants ?? null);
      })
      .catch(() => {
        if (!cancelled) setAllowedVariants(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleVariants =
    allowedVariants === null
      ? GLIMWORM_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : GLIMWORM_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  const otherWorms =
    latestSnapshot?.worms.filter((w) => w.id !== currentUserId) ?? [];
  const takenColors = new Set(otherWorms.map((w) => w.color));
  const myWorm = latestSnapshot?.worms.find((w) => w.id === currentUserId);
  const effectiveSelectedColor = selectedColor ?? myWorm?.color ?? null;

  useEffect(() => {
    const onAck = () => {
      setBusy(false);
      setError(null);
    };
    const onException = (err: unknown) => {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Server rejected the request';
      setError(msg);
      setBusy(false);
    };
    gameSocket.on('glimworm.start.ack', onAck);
    gameSocket.on('exception', onException);
    return () => {
      gameSocket.off('glimworm.start.ack', onAck);
      gameSocket.off('exception', onException);
    };
  }, []);

  const handleColor = (color: string) => {
    setColor(color);
    gameSocket.emit('glimworm.color.pick', {
      roomId: roomId,
      userId: currentUserId,
      color,
    });
  };

  const handleStartGame = (options?: {
    withBots?: boolean;
    botCount?: number;
  }) => {
    setBusy(true);
    setError(null);
    gameSocket.emit('glimworm.start', {
      roomId: roomId,
      userId: currentUserId,
      variant,
      powerupsEnabled,
      fillWithBots: !!options?.withBots,
      botCount: options?.botCount,
    });
    setTimeout(() => setBusy(false), 3000);
  };

  return {
    variant,
    setVariant,
    powerupsEnabled,
    setPowerupsEnabled,
    busy,
    error,
    visibleVariants,
    takenColors,
    effectiveSelectedColor,
    handleColor,
    handleStartGame,
  };
}

export type GlimwormLobbyState = ReturnType<typeof useGlimwormLobbyState>;
