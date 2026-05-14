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
`;

export function HudStyles() {
  return <style dangerouslySetInnerHTML={{ __html: HUD_KEYFRAMES_CSS }} />;
}
