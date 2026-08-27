import { RULE_VARIANTS, VARIANTS } from './checkers.constants';
import { isAiDifficulty } from '../../lib/ai-difficulty';

export function validateCheckersConfig(
  config: Record<string, unknown>,
): boolean {
  const variant = config.variant;
  if (variant !== undefined) {
    if (typeof variant !== 'string') return false;
    if (!(VARIANTS as readonly string[]).includes(variant)) return false;
  }

  const ruleVariant = config.ruleVariant;
  if (ruleVariant !== undefined) {
    if (typeof ruleVariant !== 'string') return false;
    if (!(RULE_VARIANTS as readonly string[]).includes(ruleVariant))
      return false;
  }

  const forcedCaptures = config.forcedCaptures;
  if (forcedCaptures !== undefined && typeof forcedCaptures !== 'boolean')
    return false;

  const backwardCaptures = config.backwardCaptures;
  if (backwardCaptures !== undefined && typeof backwardCaptures !== 'boolean')
    return false;

  const botDifficulty = config.botDifficulty ?? config.aiDifficulty;
  if (botDifficulty !== undefined && !isAiDifficulty(botDifficulty))
    return false;

  return true;
}
