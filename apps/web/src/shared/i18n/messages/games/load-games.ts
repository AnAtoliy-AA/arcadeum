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
  backgammon: () => import('./backgammon/index'),
  hearts: () => import('./hearts/index'),
  spades: () => import('./spades/index'),
  go: () => import('./go/index'),
  pachisi: () => import('./pachisi/index'),
  solitaire: () => import('./solitaire/index'),
};

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      target[key] = deepMerge(
        { ...(targetVal as Record<string, unknown>) },
        sourceVal as Record<string, unknown>,
      );
    } else {
      target[key] = sourceVal;
    }
  }
  return target;
}

export async function loadGames(
  locale: Locale,
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    Object.values(GAME_LOADERS).map(async (load) => {
      const mod = await load();
      return mod[locale] as Record<string, unknown>;
    }),
  );

  let result: Record<string, unknown> = {};
  for (const entry of entries) {
    if (entry) {
      result = deepMerge(result, entry);
    }
  }
  return result;
}
