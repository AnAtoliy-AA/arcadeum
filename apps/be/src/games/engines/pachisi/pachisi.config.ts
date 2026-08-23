import { RULE_VARIANTS, VARIANTS } from './pachisi.constants';

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
    options.ruleVariant !== undefined &&
    !RULE_VARIANTS.includes(
      options.ruleVariant as (typeof RULE_VARIANTS)[number],
    )
  ) {
    return false;
  }
  if (
    options.variant !== undefined &&
    !VARIANTS.includes(options.variant as (typeof VARIANTS)[number])
  ) {
    return false;
  }
  return true;
}
