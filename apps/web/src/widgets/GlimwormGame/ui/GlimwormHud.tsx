'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useGlimwormStore } from '../store/glimwormStore';
import type {
  GlimwormVariant,
  GlimwormWormSnapshot,
  PowerupKind,
} from '../types';

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

/** Friendly display name for a worm in the HUD. */
function displayName(
  w: GlimwormWormSnapshot,
  botIndexById: Map<string, number>,
): string {
  if (w.self) return 'You';
  if (w.id.startsWith('bot-')) {
    const idx = botIndexById.get(w.id);
    return idx !== undefined ? `Bot ${idx}` : 'Bot';
  }
  // Real human guests: show a short fingerprint until we wire usernames.
  return `Player ${w.id.slice(0, 4)}`;
}

interface GlimwormHudProps {
  /** Whether the local user is the room host (controls Restart visibility). */
  isHost?: boolean;
  /** Fired when the host clicks the inline restart icon. */
  onRestart?: () => void;
}

export function GlimwormHud(props: GlimwormHudProps = {}): React.JSX.Element | null {
  const { isHost = false, onRestart } = props;
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

  // Stable Bot 1, Bot 2, … indexing based on insertion order in the snapshot.
  const botIndexById = useMemo(() => {
    const m = new Map<string, number>();
    let i = 1;
    for (const w of snapshot.worms) {
      if (w.id.startsWith('bot-')) m.set(w.id, i++);
    }
    return m;
  }, [snapshot.worms]);

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
        {self && (
          <div
            style={{
              marginTop: 4,
              paddingTop: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: self.color,
                boxShadow: `0 0 8px ${self.color}`,
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'rgba(203,213,225,0.85)' }}>You</span>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(0,0,0,0.55)',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 13,
          minWidth: 168,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: 0.4 }}>
            {t('games.glimworm_v1.hud.score')}
          </span>
          {isHost && onRestart && (
            <button
              type="button"
              onClick={onRestart}
              aria-label="Restart round"
              title="Restart round"
              style={{
                pointerEvents: 'auto',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(177,94,255,0.25)',
                color: '#e4c8ff',
                border: '1px solid rgba(177,94,255,0.55)',
                cursor: 'pointer',
                fontSize: 12,
                lineHeight: 1,
                fontFamily: 'inherit',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ↻
            </button>
          )}
        </div>
        {top5.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: w.alive ? 1 : 0.45,
              fontWeight: w.self ? 600 : 400,
              padding: '2px 0',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: w.color,
                boxShadow: w.self ? `0 0 6px ${w.color}` : 'none',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                color: w.self ? '#fff' : 'rgba(203,213,225,0.92)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName(w, botIndexById)}
            </span>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: '#a0e8ff',
                fontWeight: 600,
              }}
            >
              {w.score}
            </span>
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
