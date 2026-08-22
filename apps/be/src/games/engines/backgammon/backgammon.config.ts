import { VARIANTS } from './backgammon.constants';

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
  if (
    options.variant !== undefined &&
    !VARIANTS.includes(options.variant as (typeof VARIANTS)[number])
  ) {
    return false;
  }
  return true;
}
