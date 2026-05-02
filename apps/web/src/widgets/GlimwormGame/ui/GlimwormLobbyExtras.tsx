'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameSocket, emitEncrypted } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { useGlimwormStore } from '../store/glimwormStore';
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

interface GlimwormLobbyExtrasProps {
  roomId: string;
  userId: string;
  isHost: boolean;
  /** Colors already taken by other players in the lobby. */
  takenColors?: string[];
}

export function GlimwormLobbyExtras({
  roomId,
  userId,
  isHost,
  takenColors = [],
}: GlimwormLobbyExtrasProps): React.JSX.Element {
  const { t } = useTranslation();
  const selectedColor = useGlimwormStore((s) => s.selectedColor);
  const setColor = useGlimwormStore((s) => s.setColor);

  const [variant, setVariant] = useState<GlimwormVariant>('battle_royale');
  const [powerupsEnabled, setPowerupsEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Listen for BE responses so users see why a click didn't transition.
  useEffect(() => {
    const onStartAck = (): void => {
      setFeedback('Starting…');
      setBusy(false);
    };
    const onException = (err: unknown): void => {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Server rejected the request';
      setFeedback(msg);
      setBusy(false);
    };
    gameSocket.on('glimworm.start.ack', onStartAck);
    gameSocket.on('exception', onException);
    return () => {
      gameSocket.off('glimworm.start.ack', onStartAck);
      gameSocket.off('exception', onException);
    };
  }, []);

  const taken = new Set(takenColors);

  const handleColor = (color: string) => {
    if (taken.has(color) && color !== selectedColor) return;
    setColor(color);
    void emitEncrypted(gameSocket, 'glimworm.color.pick', {
      roomId,
      userId,
      color,
    });
  };

  const handleReady = () => {
    const next = !ready;
    setReady(next);
    void emitEncrypted(gameSocket, 'glimworm.ready', {
      roomId,
      userId,
      ready: next,
    });
  };

  const startWith = (fillWithBots: boolean) => {
    setBusy(true);
    setFeedback(`Starting${fillWithBots ? ' solo' : ''}…`);
    void emitEncrypted(gameSocket, 'glimworm.start', {
      roomId,
      userId,
      variant,
      powerupsEnabled,
      fillWithBots,
    });
    // Failsafe re-enable in case neither ack nor exception arrives.
    setTimeout(() => setBusy(false), 3000);
  };
  const handleStart = () => startWith(false);
  const handleStartSolo = () => startWith(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 16,
        background: 'rgba(20,22,40,0.85)',
        borderRadius: 8,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          {t('games.glimworm_v1.lobby.variant')}
        </div>
        {isHost ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GLIMWORM_VARIANTS.map((v) => {
              const active = variant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariant(v.id as GlimwormVariant)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: active
                      ? 'rgba(124,255,94,0.22)'
                      : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: active
                      ? '1px solid #7cff5e'
                      : '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {v.emoji} {t(v.name as never)}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 14 }}>
            {GLIMWORM_VARIANTS.find((v) => v.id === variant)?.emoji}{' '}
            {t(
              (GLIMWORM_VARIANTS.find((v) => v.id === variant)?.name ??
                '') as never,
            )}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          {t('games.glimworm_v1.lobby.powerups')}
        </div>
        {isHost ? (
          <button
            type="button"
            onClick={() => setPowerupsEnabled((p) => !p)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: powerupsEnabled
                ? 'rgba(124,255,94,0.22)'
                : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: powerupsEnabled
                ? '1px solid #7cff5e'
                : '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {powerupsEnabled
              ? t('games.glimworm_v1.lobby.powerupsOn')
              : t('games.glimworm_v1.lobby.powerupsOff')}
          </button>
        ) : (
          <div style={{ fontSize: 14 }}>
            {powerupsEnabled
              ? t('games.glimworm_v1.lobby.powerupsOn')
              : t('games.glimworm_v1.lobby.powerupsOff')}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          {t('games.glimworm_v1.lobby.pickColor')}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PALETTE.map((color) => {
            const isTaken = taken.has(color) && color !== selectedColor;
            const isSelected = color === selectedColor;
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={isSelected}
                disabled={isTaken}
                onClick={() => handleColor(color)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: color,
                  border: isSelected ? '3px solid #fff' : '2px solid #444',
                  opacity: isTaken ? 0.3 : 1,
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                }}
              />
            );
          })}
        </div>
      </div>

      {feedback && (
        <div
          style={{
            fontSize: 12,
            padding: '6px 8px',
            borderRadius: 4,
            background: feedback.startsWith('Starting')
              ? 'rgba(94,224,255,0.15)'
              : 'rgba(255,94,94,0.15)',
            color: feedback.startsWith('Starting') ? '#a0e8ff' : '#ffaaaa',
          }}
        >
          {feedback}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={handleReady}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 6,
            background: ready ? '#7cff5e' : 'rgba(255,255,255,0.08)',
            color: ready ? '#06070d' : '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {ready ? '✓ Ready' : 'Ready'}
        </button>
        {isHost && (
          <button
            type="button"
            onClick={handleStart}
            disabled={busy}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 6,
              background: busy ? 'rgba(255,255,255,0.08)' : '#5ee0ff',
              color: '#06070d',
              border: '1px solid rgba(255,255,255,0.18)',
              cursor: busy ? 'wait' : 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Start
          </button>
        )}
      </div>

      {isHost && (
        <button
          type="button"
          onClick={handleStartSolo}
          disabled={busy}
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            background: busy
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(177,94,255,0.85)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: busy ? 'wait' : 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Start Solo (vs bots)
        </button>
      )}
    </div>
  );
}
