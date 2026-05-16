'use client';

import { useEffect, useState } from 'react';

const COUNTDOWN_TOTAL_MS = 3000;

/**
 * Renders a fading 3-2-1 number overlay during the BE-side countdown phase.
 * Mounted only while the snapshot status is 'countdown'.
 */
export function GlimwormCountdown(): React.JSX.Element {
  const [n, setN] = useState(3);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, COUNTDOWN_TOTAL_MS - elapsed);
      const next = Math.max(1, Math.ceil(remaining / 1000));
      setN(next);
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        pointerEvents: 'none',
        background: 'rgba(0, 0, 0, 0.35)',
      }}
    >
      <div
        key={n}
        style={{
          fontSize: 240,
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #5ee0ff 0%, #b15eff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 60px rgba(124, 92, 255, 0.6)',
          animation: 'glimworm-countdown-pulse 1s ease-out',
          lineHeight: 1,
        }}
      >
        {n}
      </div>
      <style>{`
        @keyframes glimworm-countdown-pulse {
          0% { transform: scale(0.4); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
