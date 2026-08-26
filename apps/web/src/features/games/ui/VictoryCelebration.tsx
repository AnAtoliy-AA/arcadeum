'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  getThemeById,
  SHARED_THEMES,
  type GameTheme,
} from '@/features/games/lib/shared-themes';

export type CelebrationTone = 'victory' | 'defeat' | 'draw';

interface VictoryCelebrationProps {
  tone: CelebrationTone;
  theme?: GameTheme | string | null;
}

const DEFAULT_VICTORY_BG_CLASSES = [
  'bg-amber-400',
  'bg-yellow-300',
  'bg-orange-400',
  'bg-white',
  'bg-purple-500',
  'bg-cyan-400',
  'bg-rose-400',
  'bg-emerald-400',
];

const DEFEAT_BG_CLASSES = [
  'bg-slate-500',
  'bg-slate-600',
  'bg-red-500',
  'bg-rose-700',
  'bg-zinc-600',
];

function resolveTheme(
  themeInput: GameTheme | string | null | undefined,
): GameTheme {
  if (!themeInput) return SHARED_THEMES[0];
  if (typeof themeInput === 'string') {
    return getThemeById(themeInput) ?? SHARED_THEMES[0];
  }
  return themeInput;
}

export function VictoryCelebration({ tone, theme }: VictoryCelebrationProps) {
  const resolvedTheme = resolveTheme(theme);

  const confettiItems = useMemo(() => {
    if (tone !== 'victory') return [];
    return Array.from({ length: 80 }).map((_, i) => ({
      slotClass: `particle-slot-${i}`,
      bgClass:
        DEFAULT_VICTORY_BG_CLASSES[i % DEFAULT_VICTORY_BG_CLASSES.length],
      sizeClass:
        i % 3 === 0 ? 'w-3.5 h-3.5' : i % 2 === 0 ? 'w-2.5 h-2.5' : 'w-2 h-2',
      roundClass: i % 2 === 0 ? 'rounded-full' : 'rounded-sm',
    }));
  }, [tone]);

  const sparkleItems = useMemo(() => {
    if (tone !== 'draw') return [];
    return Array.from({ length: 48 }).map((_, i) => ({
      slotClass: `sparkle-slot-${i}`,
      sizeClass: i % 2 === 0 ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5',
      bgClass: 'bg-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    }));
  }, [tone]);

  const emberItems = useMemo(() => {
    if (tone !== 'defeat') return [];
    return Array.from({ length: 40 }).map((_, i) => ({
      slotClass: `particle-slot-${(i * 2) % 80}`,
      bgClass: DEFEAT_BG_CLASSES[i % DEFEAT_BG_CLASSES.length],
      sizeClass: i % 3 === 0 ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5',
    }));
  }, [tone]);

  const bloomColorClass =
    tone === 'victory'
      ? 'bg-[radial-gradient(circle,rgba(255,215,0,0.35)_0%,transparent_70%)]'
      : tone === 'defeat'
        ? 'bg-[radial-gradient(circle,rgba(239,68,68,0.2)_0%,transparent_70%)]'
        : 'bg-[radial-gradient(circle,rgba(148,163,184,0.25)_0%,transparent_70%)]';

  const burstColorClass =
    tone === 'victory'
      ? 'border-amber-400/60 shadow-[0_0_30px_rgba(255,215,0,0.5)]'
      : '';

  return (
    <div
      className="celebration-layer"
      aria-hidden
      data-testid="victory-celebration"
      data-theme={resolvedTheme.id}
    >
      <div className={cx('celebration-bloom', bloomColorClass)} />

      {tone === 'victory' && (
        <div className={cx('celebration-burst', burstColorClass)} />
      )}

      {confettiItems.map((item, idx) => (
        <div
          key={`c-${idx}`}
          className={cx(
            'celebration-confetti-particle',
            item.slotClass,
            item.bgClass,
            item.sizeClass,
            item.roundClass,
          )}
        />
      ))}

      {sparkleItems.map((item, idx) => (
        <div
          key={`s-${idx}`}
          className={cx(
            'celebration-sparkle-particle rounded-full',
            item.slotClass,
            item.sizeClass,
            item.bgClass,
          )}
        />
      ))}

      {emberItems.map((item, idx) => (
        <div
          key={`e-${idx}`}
          className={cx(
            'celebration-ember-particle rounded-full',
            item.slotClass,
            item.bgClass,
            item.sizeClass,
          )}
        />
      ))}
    </div>
  );
}
