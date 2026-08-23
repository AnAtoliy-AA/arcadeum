/**
 * Turn-based games that support "Watch AI vs AI". Must stay in sync with
 * `AI_VS_AI_GAME_IDS` / `AiVsAiService.startFns` on the BE
 * (`apps/be/src/games/common/ai-vs-ai.ts`) — see the `/new-game` skill.
 * Excluded: texas_holdem_v1 (no bot service), glimworm_v1 (real-time).
 */
export const AI_VS_AI_SUPPORTED_GAME_IDS = new Set([
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
]);

export const AI_VS_AI_DELAYS = [1000, 2000, 5000] as const;

export const AI_VS_AI_DEFAULT_DELAY_MS = 2000;

export function isAiVsAiSupported(gameId: string): boolean {
  return AI_VS_AI_SUPPORTED_GAME_IDS.has(gameId);
}
