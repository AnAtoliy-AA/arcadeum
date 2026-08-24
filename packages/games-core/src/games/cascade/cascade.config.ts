import { isAiDifficulty } from '../../lib/ai-difficulty';

export function validateCascadeConfig(
  config: Record<string, unknown>,
): boolean {
  const options = config.options as Record<string, unknown> | undefined;

  const difficulty = options?.aiDifficulty ?? config.aiDifficulty;
  if (difficulty !== undefined && !isAiDifficulty(difficulty)) {
    return false;
  }

  if (options?.handLimit !== undefined) {
    const hl = options.handLimit;
    if (typeof hl !== 'number' || hl < 3 || hl > 15) {
      return false;
    }
  }

  if (options?.lastCardCallEnabled !== undefined) {
    if (typeof options.lastCardCallEnabled !== 'boolean') {
      return false;
    }
  }

  return true;
}
