import { MODES } from './pachisi.constants';

export function validatePachisiConfig(
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
    options.mode !== undefined &&
    !MODES.includes(
      options.mode as (typeof MODES)[number],
    )
  ) {
    return false;
  }
  if (options.theme !== undefined && typeof options.theme !== 'string') {
    return false;
  }
  return true;
}
