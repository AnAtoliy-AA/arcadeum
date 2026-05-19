export { VISIBILITY_TIERS, type VisibilityTier } from '../../auth/lib/roles';

export interface AdminGameVisibilityRow {
  gameId: string;
  tier: import('../../auth/lib/roles').VisibilityTier;
  variants: Array<{
    variantId: string;
    tier: import('../../auth/lib/roles').VisibilityTier;
  }>;
}
