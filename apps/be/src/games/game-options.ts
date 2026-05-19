/**
 * Extract a variant ID from a room's `gameOptions` blob.
 *
 * Reads `opts.variant` first (Glimworm + Sea Battle convention), falls back
 * to `opts.cardVariant` (Critical convention). Returns undefined when the
 * options blob is missing, malformed, or neither key holds a string.
 *
 * Used by createRoom and listRooms in games.controller.ts to drive
 * GameVisibilityService checks.
 */
export function extractVariantFromOptions(
  opts: Record<string, unknown> | undefined,
): string | undefined {
  if (!opts || typeof opts !== 'object') return undefined;
  const v = opts.variant ?? opts.cardVariant;
  return typeof v === 'string' ? v : undefined;
}
