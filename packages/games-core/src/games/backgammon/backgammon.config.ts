export function validateBackgammonConfig(
  config: Record<string, unknown>,
): boolean {
  if (!config || typeof config !== 'object') {
    return true;
  }
  const options = config.options as Record<string, unknown> | undefined;
  if (!options || typeof options !== 'object') {
    return true;
  }
  if (options.theme !== undefined && typeof options.theme !== 'string') {
    return false;
  }
  return true;
}
