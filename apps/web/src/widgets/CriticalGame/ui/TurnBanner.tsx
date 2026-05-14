'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useScenePalette } from './ScenePaletteContext';
import { useNarrowViewport } from '../lib/useNarrowViewport';

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName: string;
  secondsRemaining: number | null;
  /** Pending draws from the snapshot. Renders a +N chip when > 1. */
  pendingDraws?: number;
}

// `turnBannerDotPulse` keyframes live in `hudStyles.tsx`
// (HUD_KEYFRAMES_CSS) — `ArenaCenter` mounts `<HudStyles />` once for
// the whole widget, so the rule is already in the document by the time
// this banner paints.

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
  const isNarrow = useNarrowViewport(480);

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

  // On narrow phones the dot+label+chip+timer row blows past the
  // viewport. Stack vertically so each element gets its own line and the
  // player-name truncates instead of pushing the timer off-screen.
  const shellStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: isNarrow ? 'column' : 'row',
    alignItems: isNarrow ? 'stretch' : 'center',
    gap: isNarrow ? 4 : 10,
    padding: '8px 16px',
    borderRadius: isNarrow ? 14 : 9999,
    background: 'rgba(0, 0, 0, 0.45)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    boxShadow: palette.turnBannerShadow,
    overflow: 'hidden',
    isolation: 'isolate',
    maxWidth: '100%',
  };

  const headerRowStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  };

  // Gradient border rendered via ::before-equivalent overlay using
  // mask-composite. The radius mirrors the shell so the gradient mask
  // tracks the rounded card on phones — without this it kept the full
  // pill radius and clipped at the corners of the narrower layout.
  const borderOverlayStyle: CSSProperties = {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: isNarrow ? 14 : 9999,
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
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const timerStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.85,
    marginLeft: isNarrow ? 0 : 4,
    alignSelf: isNarrow ? 'flex-end' : 'auto',
  };

  return (
    <div data-testid="turn-banner" style={shellStyle}>
      <span aria-hidden style={borderOverlayStyle} />
      <div style={headerRowStyle}>
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
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {extraLabel}
          </span>
        )}
      </div>
      <span style={timerStyle}>{timer}</span>
    </div>
  );
}
