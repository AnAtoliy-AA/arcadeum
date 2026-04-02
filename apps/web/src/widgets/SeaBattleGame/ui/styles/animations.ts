'use client';

import { useEffect } from 'react';

const CSS = `
@keyframes breathe {
  0%, 100% { box-shadow: 0 0 8px rgba(52, 211, 153, 0.3), inset 0 0 20px rgba(52, 211, 153, 0.05); }
  50%       { box-shadow: 0 0 20px rgba(52, 211, 153, 0.6), inset 0 0 30px rgba(52, 211, 153, 0.12); }
}
@keyframes turn-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70%      { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}
@keyframes glow-hit {
  0%, 100% { box-shadow: 0 0 6px rgba(239, 68, 68, 0.5); }
  50%      { box-shadow: 0 0 18px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.3); }
}
@keyframes glow-sunk {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); }
  50%      { box-shadow: 0 0 24px rgba(239, 68, 68, 1), 0 0 40px rgba(239, 68, 68, 0.4); }
}
@keyframes valid-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(52, 211, 153, 0.4); }
  50%      { box-shadow: 0 0 12px rgba(52, 211, 153, 0.8); }
}
@keyframes selected-glow {
  0%, 100% { box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4); }
  50%      { box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.8), 0 0 12px rgba(96, 165, 250, 0.3); }
}
@keyframes preview-fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.sb-breathe     { animation: breathe 3s ease-in-out infinite; }
.sb-glow-hit    { animation: glow-hit 2s ease-in-out infinite; }
.sb-glow-sunk   { animation: glow-sunk 1.5s ease-in-out infinite; }
.sb-valid-pulse { animation: valid-pulse 1.2s ease-in-out infinite; }
.sb-selected-glow { animation: selected-glow 1.5s ease-in-out infinite; }
.sb-preview-fade  { animation: preview-fade 0.2s ease-out forwards; }
.sb-dot-blink     { animation: dot-blink 1.2s ease-in-out infinite; }
.sb-turn-pulse    { animation: turn-pulse 2s ease-in-out infinite; }
`;

let mountCount = 0;

export function useSeaBattleAnimations(): void {
  useEffect(() => {
    mountCount++;
    if (!document.getElementById('sea-battle-animations')) {
      const el = document.createElement('style');
      el.id = 'sea-battle-animations';
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    return () => {
      mountCount--;
      if (mountCount === 0) {
        document.getElementById('sea-battle-animations')?.remove();
      }
    };
  }, []);
}
