'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useScenePalette } from './ScenePaletteContext';

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName: string;
  secondsRemaining: number | null;
  /** Pending draws from the snapshot. Renders a +N chip when > 1. */
  pendingDraws?: number;
}

const PULSE_KEYFRAMES_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes turnBannerDotPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.35); opacity: 0.6; }
  }
  [data-testid="turn-banner-dot"] {
    animation: turnBannerDotPulse 1.5s ease-in-out infinite;
  }
}
`;

function formatTimer(secondsRemaining: number | null): string {
  const s = secondsRemaining ?? 0;
  const safe = Math.max(0, Math.floor(s));
  const m = Math.floor(safe / 60);
  const ss = String(safe % 60).padStart(2, '0');
  return `${m}:${ss}`;
}

export function TurnBanner({
  isMyTurn,
  currentPlayerName,
  secondsRemaining,
  pendingDraws,
}: TurnBannerProps) {
  const palette = useScenePalette();
  const { t } = useTranslation();

  const label = isMyTurn
    ? t('games.table.players.yourMove')
    : t('games.table.players.playerTurn', { name: currentPlayerName });

  const timer = formatTimer(secondsRemaining);
  const extra =
    typeof pendingDraws === 'number' ? Math.max(0, pendingDraws - 1) : 0;
  const extraLabel =
    extra > 0
      ? extra === 1
        ? t('games.table.hud.extraTurns', { count: extra })
        : t('games.table.hud.extraTurnsPlural', { count: extra })
      : null;

  const shellStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px',
    borderRadius: 9999,
    background: 'rgba(0, 0, 0, 0.45)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    boxShadow: palette.turnBannerShadow,
    overflow: 'hidden',
    isolation: 'isolate',
  };

  // Gradient border rendered via ::before-equivalent overlay using mask-composite
  const borderOverlayStyle: CSSProperties = {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    padding: 2,
    background: palette.turnBannerBorderGradient,
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: palette.turnBannerDotColor,
    boxShadow: `0 0 10px ${palette.turnBannerDotColor}`,
    flexShrink: 0,
    zIndex: 1,
  };

  const labelStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    textTransform: 'uppercase',
  };

  const timerStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.85,
    marginLeft: 4,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PULSE_KEYFRAMES_CSS }} />
      <div data-testid="turn-banner" style={shellStyle}>
        <span aria-hidden style={borderOverlayStyle} />
        <span data-testid="turn-banner-dot" style={dotStyle} />
        <span style={labelStyle}>{label}</span>
        {extraLabel && (
          <span
            data-testid="turn-banner-extra"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '2px 8px',
              borderRadius: 9999,
              background: 'rgba(245, 158, 11, 0.18)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {extraLabel}
          </span>
        )}
        <span style={timerStyle}>{timer}</span>
      </div>
    </>
  );
}
