export const AI_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;

export type AiDifficulty = (typeof AI_DIFFICULTIES)[number];

export const DEFAULT_AI_DIFFICULTY: AiDifficulty = 'medium';

export function isAiDifficulty(value: unknown): value is AiDifficulty {
  return (
    typeof value === 'string' &&
    (AI_DIFFICULTIES as readonly string[]).includes(value)
  );
}
