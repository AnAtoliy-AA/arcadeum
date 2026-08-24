import type { GameSessionSummary } from '../sessions/game-sessions.service';

/**
 * Turn-based games that support bot-vs-bot ("AI vs AI") spectating.
 *
 * Must stay in sync with:
 * - `AiVsAiService.startFns` (the per-game session starters — validated by
 *   `ai-vs-ai.service.spec.ts` so the two cannot drift)
 * - `AI_VS_AI_SUPPORTED_GAME_IDS` on the web (`features/games/lib/aiVsAi.ts`)
 *
 * Excluded on purpose:
 * - `texas_holdem_v1` — no bot service exists yet
 * - `glimworm_v1` — real-time tick engine; bots steer themselves every tick,
 *   so a fixed per-move delay does not apply
 */
export const AI_VS_AI_GAME_IDS = [
  'chess_v1',
  'checkers_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'critical_v1',
  'sea_battle_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
] as const;

export const AI_VS_AI_DELAYS_MS = [1000, 2000, 5000] as const;

export const AI_VS_AI_DEFAULT_DELAY_MS = 2000;

export interface AiVsAiExtras {
  aiVsAi: true;
  aiMoveDelayMs?: number;
  [key: string]: unknown;
}

/**
 * Pull the ai-vs-ai markers out of a `startExtras` payload so they can be
 * persisted on the session (bot services read them from `session.options`).
 * Returns null when the payload is not an AI-vs-AI start.
 */
export function extractAiVsAiExtras(startExtras: unknown): AiVsAiExtras | null {
  const raw = (startExtras ?? {}) as Record<string, unknown>;
  if (raw.aiVsAi !== true) return null;
  const delay = raw.aiMoveDelayMs;
  return {
    aiVsAi: true,
    aiMoveDelayMs:
      typeof delay === 'number' && Number.isFinite(delay) && delay > 0
        ? delay
        : undefined,
  };
}

export function isAiVsAiSession(session: GameSessionSummary): boolean {
  return session.options?.aiVsAi === true;
}

/**
 * Fixed delay between bot moves for AI-vs-AI matches, or null when the
 * session is not an AI-vs-AI match (bots fall back to their own pacing).
 */
export function getAiMoveDelayMs(session: GameSessionSummary): number | null {
  if (!isAiVsAiSession(session)) return null;
  const delay = session.options?.aiMoveDelayMs;
  return typeof delay === 'number' && Number.isFinite(delay) && delay > 0
    ? delay
    : null;
}
