/**
 * Static rarity palette for achievement chips, glows and icon accents.
 * Fixed hex literals are the project convention for static palettes
 * (genres, roles, gold) — design tokens don't cover per-rarity hues.
 */
export interface RarityStyle {
  text: string;
  border: string;
  glow: string;
}

export const RARITY_STYLES: Record<string, RarityStyle> = {
  common: {
    text: '#9ca3af',
    border: 'rgba(156, 163, 175, 0.4)',
    glow: 'rgba(156, 163, 175, 0.25)',
  },
  rare: {
    text: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.4)',
    glow: 'rgba(59, 130, 246, 0.25)',
  },
  epic: {
    text: '#a855f7',
    border: 'rgba(168, 85, 247, 0.4)',
    glow: 'rgba(168, 85, 247, 0.25)',
  },
  legendary: {
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
};

const FALLBACK = RARITY_STYLES.common;

/** Resolve a rarity style, falling back to `common` for unknown values. */
export function getRarityStyle(rarity: string): RarityStyle {
  return RARITY_STYLES[rarity] ?? FALLBACK;
}
