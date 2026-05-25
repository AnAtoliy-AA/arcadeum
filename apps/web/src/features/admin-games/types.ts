export const VISIBILITY_TIERS = [
  'all',
  'premium_plus',
  'vip_plus',
  'developers_plus',
  'none',
] as const;
export type VisibilityTier = (typeof VISIBILITY_TIERS)[number];

export interface AdminGameRow {
  gameId: string;
  tier: VisibilityTier;
  variants: Array<{ variantId: string; tier: VisibilityTier }>;
}
