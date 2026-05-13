'use client';

import { useEffect, useState } from 'react';

/**
 * Bottom-left tip that fades after a few seconds at round start so first-time
 * players know the cursor steers their worm.
 */
export function GlimwormControlsHint(): React.JSX.Element | null {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        bottom: 16,
        zIndex: 3,
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(20, 22, 40, 0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#cbd5e1',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        backdropFilter: 'blur(6px)',
        animation: 'glimworm-hint-fade 5s ease-out forwards',
        maxWidth: 260,
        lineHeight: 1.5,
      }}
    >
      <div style={{ color: '#a0e8ff', marginBottom: 4, fontWeight: 600 }}>
        How to play
      </div>
      <div>🖱 Move the mouse to steer</div>
      <div>⌨ Spacebar to use a power-up</div>
      <div>🛑 Avoid walls and other worms</div>
      <style>{`
        @keyframes glimworm-hint-fade {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
