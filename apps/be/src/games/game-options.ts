/**
 * Extract a visual theme ID from a room's `gameOptions` blob.
 *
 * Reads `opts.theme` first (canonical field), falls back to `opts.variant`
 * (legacy), then `opts.cardVariant` (Critical convention). Returns undefined
 * when the options blob is missing, malformed, or none of the keys hold a
 * string.
 *
 * Used by createRoom and listRooms in games.controller.ts to drive
 * GameVisibilityService checks.
 */
export function extractThemeFromOptions(
  opts: Record<string, unknown> | undefined,
): string | undefined {
  if (!opts || typeof opts !== 'object') return undefined;
  const v = opts.theme ?? opts.variant ?? opts.cardVariant;
  return typeof v === 'string' ? v : undefined;
}
