'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { useGlimwormStore } from '../store/glimwormStore';

export function GlimwormDeathOverlay(): React.JSX.Element | null {
  const { t } = useTranslation();
  const snapshot = useGlimwormStore((s) => s.latestSnapshot);
  if (!snapshot) return null;
  if (snapshot.variant === 'time_attack') return null;

  const self = snapshot.worms.find((w) => w.self);
  if (!self || self.alive) return null;

  const aliveOther = snapshot.worms.find((w) => !w.self && w.alive);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: 'rgba(0,0,0,0.45)',
        pointerEvents: 'none',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 1 }}>
        {t('games.glimworm_v1.death.youDied')}
      </div>
      {aliveOther && (
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <span>{t('games.glimworm_v1.death.spectating')}</span>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: aliveOther.color,
              display: 'inline-block',
            }}
          />
        </div>
      )}
    </div>
  );
}
