/**
 * VIP tier visuals for player avatars. Only the "prestige" roles get a visible
 * treatment (aura tint, nameplate color, glyph); everyday roles render normally.
 * Colors mirror the role tokens in `tamagui.config.ts`
 * (`rolePremium` / `roleVip` / `roleSupporter`).
 */
const ROLE_TIER_COLOR: Record<string, string> = {
  premium: '#fbbf24',
  vip: '#e879f9',
  supporter: '#f472b6',
};

const ROLE_GLYPH: Record<string, string> = {
  premium: '👑',
  vip: '💎',
  supporter: '🌟',
};

/** Tier accent color for a role, or null when the role has no VIP treatment. */
export function getRoleTierColor(role?: string | null): string | null {
  if (!role) return null;
  return ROLE_TIER_COLOR[role] ?? null;
}

/** Small prestige glyph for a role, or null when none applies. */
export function getRoleGlyph(role?: string | null): string | null {
  if (!role) return null;
  return ROLE_GLYPH[role] ?? null;
}
