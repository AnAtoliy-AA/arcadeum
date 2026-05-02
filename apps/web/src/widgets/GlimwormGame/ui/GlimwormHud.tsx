'use client';

import { useEffect, useState } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useGlimwormStore } from '../store/glimwormStore';
import type { GlimwormVariant, PowerupKind } from '../types';

const POWERUP_EMOJI: Record<PowerupKind, string> = {
  speed: '⚡',
  shield: '🛡️',
  shrink: '🌀',
  ghost: '👻',
};

const VARIANT_NAME_KEY: Record<GlimwormVariant, TranslationKey> = {
  battle_royale: 'games.glimworm_v1.variant.battleRoyale.name',
  time_attack: 'games.glimworm_v1.variant.timeAttack.name',
  lives_heats: 'games.glimworm_v1.variant.livesHeats.name',
};

const POWERUP_NAME_KEY: Record<PowerupKind, TranslationKey> = {
  speed: 'games.glimworm_v1.powerup.speed.name',
  shield: 'games.glimworm_v1.powerup.shield.name',
  shrink: 'games.glimworm_v1.powerup.shrink.name',
  ghost: 'games.glimworm_v1.powerup.ghost.name',
};

export function GlimwormHud(): React.JSX.Element | null {
  const { t } = useTranslation();
  const snapshot = useGlimwormStore((s) => s.latestSnapshot);
  const status = useGlimwormStore((s) => s.connectionStatus);
  const setInput = useGlimwormStore((s) => s.setInput);
  const localInput = useGlimwormStore((s) => s.localInput);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  if (!snapshot) return null;

  const self = snapshot.worms.find((w) => w.self);
  const timeRemainingMs =
    snapshot.endsAt !== null ? Math.max(0, snapshot.endsAt - now) : null;
  const seconds =
    timeRemainingMs !== null ? Math.ceil(timeRemainingMs / 1000) : null;

  const top5 = [...snapshot.worms]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const handleUsePowerup = () => {
    setInput({ angle: localInput.angle, usePowerup: true });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(0,0,0,0.5)',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        <div>{t(VARIANT_NAME_KEY[snapshot.variant])}</div>
        {seconds !== null && (
          <div>
            {t('games.glimworm_v1.hud.timer')}: {seconds}s
          </div>
        )}
        {snapshot.variant === 'lives_heats' && self && (
          <div>
            {t('games.glimworm_v1.hud.lives')}: {self.livesLeft}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(0,0,0,0.5)',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 13,
          minWidth: 140,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
          {t('games.glimworm_v1.hud.score')}
        </div>
        {top5.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: w.alive ? 1 : 0.5,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: w.color,
                display: 'inline-block',
              }}
            />
            <span style={{ flex: 1 }}>{w.id.slice(0, 8)}</span>
            <span>{w.score}</span>
          </div>
        ))}
      </div>

      {snapshot.powerupsEnabled && self?.inventoryPowerup && (
        <button
          type="button"
          onClick={handleUsePowerup}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            pointerEvents: 'auto',
            width: 64,
            height: 64,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid #fff',
            color: '#fff',
            fontSize: 28,
            cursor: 'pointer',
          }}
          aria-label={t(POWERUP_NAME_KEY[self.inventoryPowerup])}
        >
          {POWERUP_EMOJI[self.inventoryPowerup]}
        </button>
      )}

      {status === 'slow' && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,200,0,0.85)',
            color: '#000',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
          }}
        >
          • {t('games.glimworm_v1.status.slowConnection')}
        </div>
      )}
    </div>
  );
}
