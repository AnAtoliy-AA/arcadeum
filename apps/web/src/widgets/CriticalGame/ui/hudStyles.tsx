'use client';

/**
 * Single mount-point for HUD CSS — keyframes, the hand-card glow ::after,
 * the CSS-driven hand fan, and the @property-based threat pulse. Mounted
 * once by `ArenaCenter` (inside the widget's arena column) so a fresh
 * `<style>` tag isn't emitted on every re-render of its consumers.
 *
 * Re-mounting from another component would emit a duplicate `<style>`
 * block — guard via `useId()` + dedupe if multiple mount points are ever
 * needed.
 *
 * All motion-bearing rules are gated on
 * `@media (prefers-reduced-motion: no-preference)` so users with
 * motion-reduce settings never receive the pulse or the glow transition.
 */
const HUD_KEYFRAMES_CSS = `
@media (prefers-reduced-motion: no-preference) {
  /* The old threatPulse keyframes used to live here; the @property
     block below replaces them so the pulse value interpolates on the
     compositor thread instead of re-rasterizing box-shadow each step. */
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
   another card is added/removed.

   --centre splits the row symmetrically; --offset is the per-card
   distance from centre. Angle steps 2deg from centre, clamped to ±14;
   offsetY grows quadratically (distance² × 0.8 px) so the fan arcs
   upward at the edges. Matches the previous JS getFanTransform exactly.

   Browser support: clamp() ships on Chrome 79+, Firefox 75+, Safari 13.1+
   so the angle clamp works universally. The absolute-value step uses
   max(x, -1 * x) instead of abs() for the same reason — abs() only
   landed in Chrome 130 / Firefox 132 / Safari 18.4 (late 2024 / early
   2025). The class is namespaced crit- to avoid colliding with host-app
   classes; a previous unscoped .hand-card-wrapper was a foot-gun. */
.crit-hand-card-wrapper {
  display: inline-flex;
  flex-shrink: 0;
  transform-origin: bottom center;
}
.crit-hand-card-wrapper[data-fan="true"] {
  --centre: calc((var(--hand-count, 1) - 1) / 2);
  --offset: calc(var(--hand-index, 0) - var(--centre));
  --raw-angle: calc(var(--offset) * 2);
  --angle: clamp(-14, var(--raw-angle), 14);
  --abs-offset: max(var(--offset), calc(-1 * var(--offset)));
  --offset-y: calc(var(--abs-offset) * var(--abs-offset) * 0.8);
  transform: rotate(calc(var(--angle) * 1deg))
             translateY(calc(var(--offset-y) * 1px));
}

/* §4.3 — Arena as CSS grid. Three-column row (draw · center · discard)
   on desktop; on phones the centre column spans both tracks above
   draw + discard via grid-template-areas. Eliminates the JS isNarrow
   branch that previously toggled gap / padding / border / radius /
   bg / overflow on the Arena root. Sub-components (piles, ArenaCenter)
   still read isNarrow for their own internal layout — that prop stays. */
.match-arena {
  display: grid;
  width: 100%;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.06);
  background-color: rgba(8,12,20,0.55);
  overflow: hidden;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "draw center discard";
}
.match-arena > [data-area="draw"]    { grid-area: draw; }
.match-arena > [data-area="center"]  { grid-area: center; }
.match-arena > [data-area="discard"] { grid-area: discard; }
@media (max-width: 480px) {
  .match-arena {
    gap: 8px;
    padding: 8px;
    border-radius: 0;
    border: 0;
    background-color: transparent;
    overflow: visible;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "center center"
      "draw   discard";
  }
}

/* §4.5 — Threat-strip pulse via @property + custom-property
   interpolation. The old keyframes drove box-shadow directly which
   re-rasterized on every step; @property tells the engine the value
   is a number so the compositor can interpolate it on its own thread,
   and we read it into box-shadow once. Falls back gracefully where
   @property is unsupported (older Firefox) — the rule just doesn't
   animate, no broken visual. */
@property --threat-pulse {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}
@media (prefers-reduced-motion: no-preference) {
  [data-testid="threat-strip"][data-pulse="true"] {
    animation: threatPulseProperty 1.4s ease-in-out infinite;
    box-shadow: 0 0 calc(6px * var(--threat-pulse))
                calc(2px * var(--threat-pulse)) rgba(239, 68, 68, 0.45);
  }
  @keyframes threatPulseProperty {
    0%, 100% { --threat-pulse: 0; }
    50%      { --threat-pulse: 1; }
  }
}

/* §3.3 — Fluid widget width + container query. The 1240px fixed cap
   left ultrawide users staring at a slab of empty space when the host
   app's chrome didn't fill the slot; min() trades the cap for a 24px
   gutter on either side once the viewport exceeds 1288px. container-type
   declares the widget as a containment context so the arena can respond
   to the SLOT width rather than viewport — useful when the same widget
   is embedded as a small lobby preview vs. a fullscreen match.
   Container queries ship in Chrome 105+ / Firefox 110+ / Safari 16+
   (Sep 2022). In unsupported browsers the @container rule is ignored;
   the arena keeps its default 24px gap / 12px×16px padding, so no
   broken visual — just no extra breathing room on ultrawide. */
[data-testid="match-widget-grid"] {
  max-width: min(1240px, calc(100vw - 48px));
  container-type: inline-size;
}
@container (min-width: 1400px) {
  .match-arena {
    gap: 32px;
    padding: 16px 24px;
  }
}

`;

export function HudStyles() {
  return <style dangerouslySetInnerHTML={{ __html: HUD_KEYFRAMES_CSS }} />;
}
