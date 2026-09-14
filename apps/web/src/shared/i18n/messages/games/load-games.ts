import type { Locale } from '../../types';

type GameMessages = Record<string, unknown>;

type GameLoader = (locale: string) => Promise<GameMessages>;

const GAME_LOADERS: Record<string, GameLoader> = {
  shared: (locale) => import('./shared/index').then((m) => m.loadSharedMessages(locale)),
  critical: (locale) => import('./critical/index').then((m) => m.loadCriticalMessages(locale)),
  texasHoldem: (locale) => import('./texas-holdem').then((m) => {
    const map: Record<string, typeof m.en> = { en: m.en, es: m.es, fr: m.fr, ru: m.ru, by: m.by };
    return map[locale] ?? m.en;
  }),
  seaBattle: (locale) => import('./sea-battle/index').then((m) => m.loadSeaBattleMessages(locale)),
  glimworm: (locale) => import('./glimworm/index').then((m) => m.loadGlimwormMessages(locale)),
  ticTacToe: (locale) => import('./tic-tac-toe/index').then((m) => m.loadTicTacToeMessages(locale)),
  cascade: (locale) => import('./cascade/index').then((m) => m.loadCascadeMessages(locale)),
  chess: (locale) => import('./chess/index').then((m) => m.loadChessMessages(locale)),
  checkers: (locale) => import('./checkers/index').then((m) => m.loadCheckersMessages(locale)),
  catDash: (locale) => import('./cat-dash/index').then((m) => m.loadCatDashMessages(locale)),
  backgammon: (locale) => import('./backgammon/index').then((m) => m.loadBackgammonMessages(locale)),
  hearts: (locale) => import('./hearts/index').then((m) => m.loadHeartsMessages(locale)),
  spades: (locale) => import('./spades/index').then((m) => m.loadSpadesMessages(locale)),
  go: (locale) => import('./go/index').then((m) => m.loadGoMessages(locale)),
  pachisi: (locale) => import('./pachisi/index').then((m) => m.loadPachisiMessages(locale)),
  solitaire: (locale) => import('./solitaire/index').then((m) => m.loadSolitaireMessages(locale)),
  minesweeper: (locale) => import('./minesweeper/index').then((m) => m.loadMinesweeperMessages(locale)),
  sudoku: (locale) => import('./sudoku/index').then((m) => m.loadSudokuMessages(locale)),
  game2048: (locale) => import('./game-2048/index').then((m) => m.loadGame2048Messages(locale)),
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
      return load(locale) as Promise<Record<string, unknown>>;
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
