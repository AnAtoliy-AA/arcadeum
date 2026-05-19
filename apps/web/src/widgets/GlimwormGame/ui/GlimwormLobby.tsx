'use client';

import { useEffect, useState } from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { gameSocket } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { useGlimwormStore } from '../store/glimwormStore';
import type { GameRoomSummary } from '@/shared/types/games';
import type { GlimwormVariant } from '../types';

const PALETTE = [
  '#ff5e5e',
  '#ffb05e',
  '#ffe65e',
  '#7cff5e',
  '#5effb6',
  '#5ee0ff',
  '#5e8cff',
  '#b15eff',
  '#ff5ed4',
  '#a0ffea',
];

const MIN_PLAYERS = 2;

const GLIMWORM_THEME: GameLobbyTheme = {
  titleGradient:
    'linear-gradient(90deg, #7cff5e 0%, #5ee0ff 50%, #b15eff 100%)',
  variantGradient: 'linear-gradient(135deg, #5ee0ff 0%, #b15eff 100%)',
  buttonGradient: 'linear-gradient(135deg, #5ee0ff 0%, #7c5cff 100%)',
};

interface GlimwormLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  currentUserId: string;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
}

export function GlimwormLobby({
  room,
  isHost,
  currentUserId,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
}: GlimwormLobbyProps): React.JSX.Element {
  const { t } = useTranslation();
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

  // One-shot catalog fetch on mount to filter the variant picker by what
  // the caller's role can actually see (ARC-710). Failure is silent: the
  // full list is shown and the BE will reject any restricted start.
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
      ? GLIMWORM_VARIANTS
      : GLIMWORM_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        );

  // Read which colors are claimed by which player. The BE pushes a fresh
  // snapshot on join/leave/color-pick, so this reflects the live lobby state.
  const otherWorms =
    latestSnapshot?.worms.filter((w) => w.id !== currentUserId) ?? [];
  const takenColors = new Set(otherWorms.map((w) => w.color));
  const myWorm = latestSnapshot?.worms.find((w) => w.id === currentUserId);
  const effectiveSelectedColor = selectedColor ?? myWorm?.color ?? null;

  // Listen for BE responses so we can clear busy + surface errors.
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
      roomId: room.id,
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
      roomId: room.id,
      userId: currentUserId,
      variant,
      powerupsEnabled,
      fillWithBots: !!options?.withBots,
      botCount: options?.botCount,
    });
    // Failsafe: re-enable in case neither ack nor exception arrives.
    setTimeout(() => setBusy(false), 3000);
  };

  const variantInfo = GLIMWORM_VARIANTS.find((v) => v.id === variant);

  const optionsSlot =
    room.status === 'lobby' ? (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '12px 0',
        }}
      >
        {/* Variant picker — host-only interactive; guests see static label */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(148,163,184,0.7)',
              marginBottom: 8,
            }}
          >
            {t('games.glimworm_v1.lobby.variant')}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {visibleVariants.map((v) => {
              const active = variant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => isHost && setVariant(v.id as GlimwormVariant)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: active
                      ? 'rgba(94,224,255,0.18)'
                      : 'rgba(255,255,255,0.04)',
                    border: active
                      ? '1.5px solid rgba(94,224,255,0.6)'
                      : '1.5px solid rgba(255,255,255,0.10)',
                    color: active ? '#a0e8ff' : '#cbd5e1',
                    cursor: isHost ? 'pointer' : 'default',
                    opacity: isHost || active ? 1 : 0.5,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  {v.emoji} {t(v.name as TranslationKey)}
                </button>
              );
            })}
          </div>
          {!isHost && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: 'rgba(148,163,184,0.6)',
                fontStyle: 'italic',
              }}
            >
              Host chooses the variant.
            </div>
          )}
        </div>

        {/* Power-ups toggle — host-only */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(148,163,184,0.7)',
              marginBottom: 8,
            }}
          >
            {t('games.glimworm_v1.lobby.powerups')}
          </div>
          <button
            type="button"
            disabled={!isHost}
            onClick={() => isHost && setPowerupsEnabled((p) => !p)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              background: powerupsEnabled
                ? 'rgba(177,94,255,0.20)'
                : 'rgba(255,255,255,0.04)',
              border: powerupsEnabled
                ? '1.5px solid rgba(177,94,255,0.6)'
                : '1.5px solid rgba(255,255,255,0.10)',
              color: powerupsEnabled ? '#d4a8ff' : '#cbd5e1',
              cursor: isHost ? 'pointer' : 'default',
              opacity: isHost ? 1 : 0.7,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            {powerupsEnabled
              ? `✓ ${t('games.glimworm_v1.lobby.powerupsOn')}`
              : t('games.glimworm_v1.lobby.powerupsOff')}
          </button>
        </div>

        {/* Color picker */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(148,163,184,0.7)',
              marginBottom: 8,
            }}
          >
            {t('games.glimworm_v1.lobby.pickColor')}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PALETTE.map((color) => {
              const isSelected = color === effectiveSelectedColor;
              const isTaken = takenColors.has(color) && !isSelected;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  aria-pressed={isSelected}
                  disabled={isTaken}
                  onClick={() => !isTaken && handleColor(color)}
                  title={isTaken ? 'Taken by another player' : color}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: color,
                    border: isSelected
                      ? '3px solid #fff'
                      : '2px solid rgba(255,255,255,0.18)',
                    opacity: isTaken ? 0.3 : 1,
                    cursor: isTaken ? 'not-allowed' : 'pointer',
                  }}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 4,
              background: 'rgba(255,94,94,0.12)',
              color: '#ffb0b0',
            }}
          >
            {error}
          </div>
        )}
      </div>
    ) : null;

  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={busy}
      onStartGame={handleStartGame}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onLeaveRoom={onLeaveRoom}
      gameName={t('games.glimworm_v1.name' as TranslationKey)}
      gameIcon="🐛"
      roomIcon={variantInfo?.emoji ?? '✨'}
      variantName={
        variantInfo?.name ? t(variantInfo.name as TranslationKey) : undefined
      }
      minPlayers={MIN_PLAYERS}
      labels={{
        waitingLabel: t('games.glimworm_v1.lobby.waitingForPlayers'),
        startWithBotsLabel: t('games.glimworm_v1.lobby.fillWithBots'),
      }}
      theme={GLIMWORM_THEME}
      optionsSlot={optionsSlot}
      enableBots={true}
    />
  );
}
