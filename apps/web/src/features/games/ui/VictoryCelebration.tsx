'use client';

import React, { useMemo } from 'react';
import { styled, YStack } from 'tamagui';

export type CelebrationTone = 'victory' | 'defeat' | 'draw';

const Layer = styled(YStack, {
  name: 'VictoryCelebrationLayer',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 0,
});

// Gold-weighted palette for wins; muted cool flecks for losses.
const VICTORY_COLORS = [
  '#FFD700',
  '#ffe866',
  '#ff9500',
  '#ffffff',
  '#a855f7',
  '#22d3ee',
];
const DEFEAT_COLORS = ['#64748b', '#475569', '#94a3b8'];

type ToneConfig = {
  confettiCount: number;
  confettiColors: string[];
  sparkleCount: number;
  bloomColor: string;
  burst: boolean;
};

const TONE_CONFIG: Record<CelebrationTone, ToneConfig> = {
  victory: {
    confettiCount: 80,
    confettiColors: VICTORY_COLORS,
    sparkleCount: 28,
    bloomColor: 'rgba(255, 215, 0, 0.45)',
    burst: true,
  },
  defeat: {
    confettiCount: 16,
    confettiColors: DEFEAT_COLORS,
    sparkleCount: 0,
    bloomColor: 'rgba(100, 116, 139, 0.3)',
    burst: false,
  },
  draw: {
    confettiCount: 0,
    confettiColors: [],
    sparkleCount: 12,
    bloomColor: 'rgba(148, 163, 184, 0.32)',
    burst: false,
  },
};

// Deterministic spread so SSR and client markup match (no Math.random).
function buildConfetti(count: number, colors: string[]) {
  return Array.from({ length: count }).map((_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 10) * 0.18,
    duration: 3 + (i % 5) * 0.4,
    size: 6 + (i % 4) * 3,
    color: colors[i % colors.length],
    rounded: i % 3 === 0,
  }));
}

function buildSparkles(count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    left: (i * 53) % 100,
    bottom: (i * 17) % 40,
    delay: (i % 8) * 0.35,
    duration: 2.4 + (i % 4) * 0.5,
    size: 4 + (i % 3) * 4,
  }));
}

/**
 * Full-bleed celebratory FX layer for the end-of-game result. Tone-aware:
 * a dense gold confetti + rising sparkles + radial bloom for wins, a restrained
 * version for draws, and a sparse muted variant for losses. Purely decorative
 * (pointer-events: none); animations collapse automatically under
 * `prefers-reduced-motion` via the global rule in `animations.css`.
 */
export function VictoryCelebration({ tone }: { tone: CelebrationTone }) {
  const config = TONE_CONFIG[tone];
  const confetti = useMemo(
    () => buildConfetti(config.confettiCount, config.confettiColors),
    [config.confettiCount, config.confettiColors],
  );
  const sparkles = useMemo(
    () => buildSparkles(config.sparkleCount),
    [config.sparkleCount],
  );

  return (
    <Layer aria-hidden testID="victory-celebration">
      {/* Breathing radial bloom behind the card. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70vmin',
          height: '70vmin',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${config.bloomColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          animation: 'celebration-bloom 3.2s ease-in-out infinite',
        }}
      />

      {/* One-shot expanding ring on reveal (wins only). */}
      {config.burst ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '40vmin',
            height: '40vmin',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            animation: 'celebration-burst 1.1s ease-out forwards',
          }}
        />
      ) : null}

      {/* Falling confetti. */}
      {confetti.map((p, i) => (
        <div
          key={`c-${i}`}
          style={{
            position: 'absolute',
            top: -12,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.rounded ? '50%' : 2,
            animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Rising sparkles. */}
      {sparkles.map((s, i) => (
        <div
          key={`s-${i}`}
          style={{
            position: 'absolute',
            bottom: `${s.bottom}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #ffffff 0%, rgba(255,230,102,0.8) 45%, transparent 70%)',
            boxShadow: '0 0 8px rgba(255, 230, 102, 0.9)',
            animation: `sparkle-rise ${s.duration}s ease-in ${s.delay}s infinite`,
          }}
        />
      ))}
    </Layer>
  );
}
