'use client';

/**
 * Single mount-point for HUD keyframes used by ThreatStrip and FlashBanner.
 * Rendered once via MatchHud so we don't emit a fresh <style> tag every
 * time those components re-render.
 *
 * The threatPulse animation is gated on prefers-reduced-motion: no-preference
 * so users with motion-reduce settings never receive the pulse.
 */
const HUD_KEYFRAMES_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes threatPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    50%      { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.18); }
  }
  [data-testid="threat-strip"][data-pulse="true"] {
    animation: threatPulse 1.4s ease-in-out infinite;
  }
  @keyframes turnBannerDotPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.35); opacity: 0.6; }
  }
  [data-testid="turn-banner-dot"] {
    animation: turnBannerDotPulse 1.5s ease-in-out infinite;
  }
}
@keyframes flashBannerIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* §4.1 — HandCard glow via ::after pseudo-element instead of tamagui's
   shadow* props. The pseudo-layer composites on the GPU and animates
   the box-shadow on the compositor thread; the role/selection state
   are attribute-keyed so React doesn't have to push a render to update
   the glow when selection toggles. */
[data-testid^="hand-card-"] {
  --glow-radius: 8px;
  --glow-color: transparent;
}
[data-testid^="hand-card-"]::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 var(--glow-radius) var(--glow-color);
  pointer-events: none;
  z-index: -1;
}
@media (prefers-reduced-motion: no-preference) {
  [data-testid^="hand-card-"]::after {
    transition: box-shadow 180ms ease-out;
  }
}
[data-testid^="hand-card-"][data-role="attack"]   { --glow-color: rgba(239,68,68,0.35); }
[data-testid^="hand-card-"][data-role="defuse"]   { --glow-color: rgba(52,211,153,0.35); }
[data-testid^="hand-card-"][data-role="skip"]     { --glow-color: rgba(56,189,248,0.35); }
[data-testid^="hand-card-"][data-role="nope"]     { --glow-color: rgba(245,158,11,0.35); }
[data-testid^="hand-card-"][data-role="favor"]    { --glow-color: rgba(167,139,250,0.35); }
[data-testid^="hand-card-"][data-role="see"]      { --glow-color: rgba(34,211,238,0.35); }
[data-testid^="hand-card-"][data-role="combo"]    { --glow-color: rgba(250,204,21,0.35); }
[data-testid^="hand-card-"][data-role="special"]  { --glow-color: rgba(244,114,182,0.40); }
[data-testid^="hand-card-"][data-selected="true"] {
  --glow-radius: 14px;
  --glow-color: rgba(52,211,153,0.55);
}
[data-testid^="hand-card-"]:hover {
  --glow-radius: 12px;
}
[data-testid^="hand-card-"][data-selected="true"]:hover {
  --glow-radius: 18px;
}

/* §4.4 — Hand fan transform driven by CSS custom properties. JS only
   sets --hand-index and --hand-count on each card wrapper; the math
   lives in CSS so the fan re-paints without a React re-render when
   another card is added/removed. Targets Chrome 116+, Firefox 118+,
   Safari 17.4+ (abs() and clamp() with numeric args). Older browsers
   gracefully fall through to no fan — cards still render in order.

   --centre splits the row symmetrically; --offset is the per-card
   distance from centre. Angle steps 2deg from centre, clamped to ±14;
   offsetY grows quadratically (distance² × 0.8 px) so the fan arcs
   upward at the edges. Matches the previous JS getFanTransform exactly. */
.hand-card-wrapper {
  display: inline-flex;
  flex-shrink: 0;
  transform-origin: bottom center;
}
.hand-card-wrapper[data-fan="true"] {
  --centre: calc((var(--hand-count, 1) - 1) / 2);
  --offset: calc(var(--hand-index, 0) - var(--centre));
  --raw-angle: calc(var(--offset) * 2);
  --angle: clamp(-14, var(--raw-angle), 14);
  --abs-offset: abs(var(--offset));
  --offset-y: calc(var(--abs-offset) * var(--abs-offset) * 0.8);
  transform: rotate(calc(var(--angle) * 1deg))
             translateY(calc(var(--offset-y) * 1px));
}
`;

export function HudStyles() {
  return <style dangerouslySetInnerHTML={{ __html: HUD_KEYFRAMES_CSS }} />;
}
