import type { Locale } from '../../types';

type GameModule = {
  en: Record<string, unknown>;
  es: Record<string, unknown>;
  fr: Record<string, unknown>;
  ru: Record<string, unknown>;
  by: Record<string, unknown>;
};

type GameLoader = () => Promise<GameModule>;

const GAME_LOADERS: Record<string, GameLoader> = {
  shared: () => import('./shared/index'),
  critical: () => import('./critical/index'),
  texasHoldem: () => import('./texas-holdem'),
  seaBattle: () => import('./sea-battle/index'),
  glimworm: () => import('./glimworm/index'),
  ticTacToe: () => import('./tic-tac-toe/index'),
  cascade: () => import('./cascade/index'),
  chess: () => import('./chess/index'),
  checkers: () => import('./checkers/index'),
  catDash: () => import('./cat-dash/index'),
};

export async function loadGames(
  locale: Locale,
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    Object.values(GAME_LOADERS).map(async (load) => {
      const mod = await load();
      return mod[locale] as Record<string, unknown>;
    }),
  );

  const result: Record<string, unknown> = {};
  for (const entry of entries) {
    Object.assign(result, entry);
  }
  return result;
}
