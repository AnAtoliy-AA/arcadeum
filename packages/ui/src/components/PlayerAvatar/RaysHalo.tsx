'use client';

import { View } from 'tamagui';

export const RAYS_SPIN_CLASS = 'arcadeum-player-avatar-rays-spin';

// Inject the rays-spin keyframes once on the client. packages/ui has no CSS
// module pipeline, so the slow halo rotation (matching the old shop preview)
// lives in a single injected stylesheet. The keyframe keeps the centering
// translate so the halo stays locked on the avatar while it spins, and a
// reduced-motion query disables the animation.
function ensureRaysKeyframes(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(RAYS_SPIN_CLASS)) return;
  const style = document.createElement('style');
  style.id = RAYS_SPIN_CLASS;
  style.textContent = `
@keyframes ${RAYS_SPIN_CLASS} {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.${RAYS_SPIN_CLASS} {
  animation: ${RAYS_SPIN_CLASS} 28s linear infinite;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .${RAYS_SPIN_CLASS} { animation: none; }
}`;
  document.head.appendChild(style);
}

ensureRaysKeyframes();

// The 12-spike conic gradient + circular mask. Positioning is applied at the
// render site so the halo can be centered on the avatar disc regardless of
// the surrounding layout (the disc sits above the name in card chrome).
export function buildRaysStyle(raysColor: string | null): React.CSSProperties | null {
  if (!raysColor) return null;
  const stops: string[] = [];
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const peak = (i * 360) / steps;
    const valley = peak + 360 / steps / 2;
    stops.push(`${raysColor} ${peak}deg`);
    stops.push(`transparent ${valley}deg`);
  }
  stops.push(`${raysColor} 360deg`);
  return {
    opacity: 0.55,
    pointerEvents: 'none',
    backgroundImage: `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`,
    WebkitMaskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 60%, transparent 100%)',
    maskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 60%, transparent 100%)',
  };
}

interface RaysHaloProps {
  style: React.CSSProperties;
  testId?: string;
  /** Halo diameter in px — centered on the avatar disc. */
  haloSize: number;
}

// A square ray layer centered on the disc center via 50%/translate, so the
// glow radiates symmetrically around the avatar no matter where the disc sits
// in its parent. Sits behind the disc (the disc paints over the masked center).
export function RaysHalo({ style, testId, haloSize }: RaysHaloProps) {
  return (
    <View
      position="absolute"
      top="50%"
      left="50%"
      width={haloSize}
      height={haloSize}
      pointerEvents="none"
      className={RAYS_SPIN_CLASS}
      data-testid={testId}
      style={{ ...style, transform: 'translate(-50%, -50%)' }}
    />
  );
}
