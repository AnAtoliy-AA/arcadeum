export const AI_VS_AI_SUPPORTED_GAME_IDS = new Set([
  'chess_v1',
  'checkers_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'critical_v1',
  'sea_battle_v1',
  'cat_dash_v1',
]);

export const AI_VS_AI_DELAYS = [1000, 2000, 5000] as const;

export const AI_VS_AI_DEFAULT_DELAY_MS = 2000;

export function isAiVsAiSupported(gameId: string): boolean {
  return AI_VS_AI_SUPPORTED_GAME_IDS.has(gameId);
}
