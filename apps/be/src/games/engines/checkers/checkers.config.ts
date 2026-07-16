export function validateCheckersConfig(config: Record<string, unknown>): boolean {
  const variant = config.variant;
  if (variant !== undefined && typeof variant !== 'string') return false;

  const forcedCaptures = config.forcedCaptures;
  if (forcedCaptures !== undefined && typeof forcedCaptures !== 'boolean') return false;

  return true;
}
