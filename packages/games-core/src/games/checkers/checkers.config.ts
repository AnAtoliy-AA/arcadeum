import { MODES } from './checkers.constants';
import { isAiDifficulty } from '../../lib/ai-difficulty';

export function validateCheckersConfig(
  config: Record<string, unknown>,
): boolean {
  const variant = config.variant;
  if (variant !== undefined && typeof variant !== 'string') return false;

  const mode = config.mode;
  if (mode !== undefined) {
    if (typeof mode !== 'string') return false;
    if (!(MODES as readonly string[]).includes(mode))
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
