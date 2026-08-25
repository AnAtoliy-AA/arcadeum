import type { Locale } from '@/shared/i18n';
import { DEFAULT_LOCALE } from '@/shared/i18n';
import type { BlogPost } from './types';

import { post as howToPlaySeaBattleEn } from './posts/how-to-play-sea-battle/en';
import { post as howToPlaySeaBattleEs } from './posts/how-to-play-sea-battle/es';
import { post as howToPlaySeaBattleFr } from './posts/how-to-play-sea-battle/fr';
import { post as howToPlaySeaBattleRu } from './posts/how-to-play-sea-battle/ru';
import { post as howToPlaySeaBattleBy } from './posts/how-to-play-sea-battle/by';

import { post as howToPlayChessEn } from './posts/how-to-play-chess/en';
import { post as howToPlayChessEs } from './posts/how-to-play-chess/es';
import { post as howToPlayChessFr } from './posts/how-to-play-chess/fr';
import { post as howToPlayChessRu } from './posts/how-to-play-chess/ru';
import { post as howToPlayChessBy } from './posts/how-to-play-chess/by';

import { post as howToPlayCheckersEn } from './posts/how-to-play-checkers/en';
import { post as howToPlayCheckersEs } from './posts/how-to-play-checkers/es';
import { post as howToPlayCheckersFr } from './posts/how-to-play-checkers/fr';
import { post as howToPlayCheckersRu } from './posts/how-to-play-checkers/ru';
import { post as howToPlayCheckersBy } from './posts/how-to-play-checkers/by';

import { post as howToPlayBackgammonEn } from './posts/how-to-play-backgammon/en';
import { post as howToPlayBackgammonEs } from './posts/how-to-play-backgammon/es';
import { post as howToPlayBackgammonFr } from './posts/how-to-play-backgammon/fr';
import { post as howToPlayBackgammonRu } from './posts/how-to-play-backgammon/ru';
import { post as howToPlayBackgammonBy } from './posts/how-to-play-backgammon/by';

import { post as howToPlayHeartsEn } from './posts/how-to-play-hearts/en';
import { post as howToPlayHeartsEs } from './posts/how-to-play-hearts/es';
import { post as howToPlayHeartsFr } from './posts/how-to-play-hearts/fr';
import { post as howToPlayHeartsRu } from './posts/how-to-play-hearts/ru';
import { post as howToPlayHeartsBy } from './posts/how-to-play-hearts/by';

import { post as howToPlaySolitaireEn } from './posts/how-to-play-solitaire/en';
import { post as howToPlaySolitaireEs } from './posts/how-to-play-solitaire/es';
import { post as howToPlaySolitaireFr } from './posts/how-to-play-solitaire/fr';
import { post as howToPlaySolitaireRu } from './posts/how-to-play-solitaire/ru';
import { post as howToPlaySolitaireBy } from './posts/how-to-play-solitaire/by';

import { post as howToPlayMinesweeperEn } from './posts/how-to-play-minesweeper/en';
import { post as howToPlayMinesweeperEs } from './posts/how-to-play-minesweeper/es';
import { post as howToPlayMinesweeperFr } from './posts/how-to-play-minesweeper/fr';
import { post as howToPlayMinesweeperRu } from './posts/how-to-play-minesweeper/ru';
import { post as howToPlayMinesweeperBy } from './posts/how-to-play-minesweeper/by';

import { post as howToPlaySudokuEn } from './posts/how-to-play-sudoku/en';
import { post as howToPlaySudokuEs } from './posts/how-to-play-sudoku/es';
import { post as howToPlaySudokuFr } from './posts/how-to-play-sudoku/fr';
import { post as howToPlaySudokuRu } from './posts/how-to-play-sudoku/ru';
import { post as howToPlaySudokuBy } from './posts/how-to-play-sudoku/by';

import { post as howToWin2048En } from './posts/how-to-win-2048/en';
import { post as howToWin2048Es } from './posts/how-to-win-2048/es';
import { post as howToWin2048Fr } from './posts/how-to-win-2048/fr';
import { post as howToWin2048Ru } from './posts/how-to-win-2048/ru';
import { post as howToWin2048By } from './posts/how-to-win-2048/by';

import { post as howToWinTicTacToeEn } from './posts/how-to-win-tic-tac-toe/en';
import { post as howToWinTicTacToeFr } from './posts/how-to-win-tic-tac-toe/fr';
import { post as howToWinTicTacToeRu } from './posts/how-to-win-tic-tac-toe/ru';
import { post as howToWinTicTacToeBy } from './posts/how-to-win-tic-tac-toe/by';

import { post as howToPlayGoEn } from './posts/how-to-play-go/en';
import { post as howToPlayGoFr } from './posts/how-to-play-go/fr';
import { post as howToPlayGoRu } from './posts/how-to-play-go/ru';
import { post as howToPlayGoBy } from './posts/how-to-play-go/by';

import { post as howToPlayCriticalEn } from './posts/how-to-play-critical/en';
import { post as howToPlayCriticalEs } from './posts/how-to-play-critical/es';
import { post as howToPlayCriticalFr } from './posts/how-to-play-critical/fr';
import { post as howToPlayCriticalRu } from './posts/how-to-play-critical/ru';
import { post as howToPlayCriticalBy } from './posts/how-to-play-critical/by';

import { post as howToPlayCascadeEn } from './posts/how-to-play-cascade/en';
import { post as howToPlayCascadeEs } from './posts/how-to-play-cascade/es';
import { post as howToPlayCascadeFr } from './posts/how-to-play-cascade/fr';
import { post as howToPlayCascadeRu } from './posts/how-to-play-cascade/ru';
import { post as howToPlayCascadeBy } from './posts/how-to-play-cascade/by';

import { post as howToPlayGlimwormEn } from './posts/how-to-play-glimworm/en';
import { post as howToPlayGlimwormEs } from './posts/how-to-play-glimworm/es';
import { post as howToPlayGlimwormFr } from './posts/how-to-play-glimworm/fr';
import { post as howToPlayGlimwormRu } from './posts/how-to-play-glimworm/ru';
import { post as howToPlayGlimwormBy } from './posts/how-to-play-glimworm/by';

import { post as howToPlayCatDashEn } from './posts/how-to-play-cat-dash/en';
import { post as howToPlayCatDashEs } from './posts/how-to-play-cat-dash/es';
import { post as howToPlayCatDashFr } from './posts/how-to-play-cat-dash/fr';
import { post as howToPlayCatDashRu } from './posts/how-to-play-cat-dash/ru';
import { post as howToPlayCatDashBy } from './posts/how-to-play-cat-dash/by';

import { post as howToPlayPachisiEn } from './posts/how-to-play-pachisi/en';
import { post as howToPlayPachisiEs } from './posts/how-to-play-pachisi/es';
import { post as howToPlayPachisiFr } from './posts/how-to-play-pachisi/fr';
import { post as howToPlayPachisiRu } from './posts/how-to-play-pachisi/ru';
import { post as howToPlayPachisiBy } from './posts/how-to-play-pachisi/by';

import { post as platformStatsEn } from './posts/platform-stats/en';
import { post as annotatedChessReplayEn } from './posts/annotated-chess-replay/en';
import { post as climbingRankedEn } from './posts/climbing-ranked/en';
import { post as patchNotesV124En } from './posts/patch-notes-v1-24/en';

/**
 * Registry of all blog posts, grouped by canonical slug. Each slug points
 * to a per-locale record so the index page and post page can look up the
 * right localized copy in O(1), and so the sitemap can enumerate every
 * (locale, slug) pair without a directory scan at request time.
 */
const POSTS: Record<string, Partial<Record<Locale, BlogPost>>> = {
  'how-to-play-sea-battle': {
    en: howToPlaySeaBattleEn,
    es: howToPlaySeaBattleEs,
    fr: howToPlaySeaBattleFr,
    ru: howToPlaySeaBattleRu,
    by: howToPlaySeaBattleBy,
  },
  'how-to-play-chess': {
    en: howToPlayChessEn,
    es: howToPlayChessEs,
    fr: howToPlayChessFr,
    ru: howToPlayChessRu,
    by: howToPlayChessBy,
  },
  'how-to-play-checkers': {
    en: howToPlayCheckersEn,
    es: howToPlayCheckersEs,
    fr: howToPlayCheckersFr,
    ru: howToPlayCheckersRu,
    by: howToPlayCheckersBy,
  },
  'how-to-play-backgammon': {
    en: howToPlayBackgammonEn,
    es: howToPlayBackgammonEs,
    fr: howToPlayBackgammonFr,
    ru: howToPlayBackgammonRu,
    by: howToPlayBackgammonBy,
  },
  'how-to-play-hearts': {
    en: howToPlayHeartsEn,
    es: howToPlayHeartsEs,
    fr: howToPlayHeartsFr,
    ru: howToPlayHeartsRu,
    by: howToPlayHeartsBy,
  },
  'how-to-play-solitaire': {
    en: howToPlaySolitaireEn,
    es: howToPlaySolitaireEs,
    fr: howToPlaySolitaireFr,
    ru: howToPlaySolitaireRu,
    by: howToPlaySolitaireBy,
  },
  'how-to-play-minesweeper': {
    en: howToPlayMinesweeperEn,
    es: howToPlayMinesweeperEs,
    fr: howToPlayMinesweeperFr,
    ru: howToPlayMinesweeperRu,
    by: howToPlayMinesweeperBy,
  },
  'how-to-play-sudoku': {
    en: howToPlaySudokuEn,
    es: howToPlaySudokuEs,
    fr: howToPlaySudokuFr,
    ru: howToPlaySudokuRu,
    by: howToPlaySudokuBy,
  },
  'how-to-win-2048': {
    en: howToWin2048En,
    es: howToWin2048Es,
    fr: howToWin2048Fr,
    ru: howToWin2048Ru,
    by: howToWin2048By,
  },
  'how-to-win-tic-tac-toe': {
    en: howToWinTicTacToeEn,
    fr: howToWinTicTacToeFr,
    ru: howToWinTicTacToeRu,
    by: howToWinTicTacToeBy,
  },
  'how-to-play-go': {
    en: howToPlayGoEn,
    fr: howToPlayGoFr,
    ru: howToPlayGoRu,
    by: howToPlayGoBy,
  },
  'how-to-play-critical': {
    en: howToPlayCriticalEn,
    es: howToPlayCriticalEs,
    fr: howToPlayCriticalFr,
    ru: howToPlayCriticalRu,
    by: howToPlayCriticalBy,
  },
  'how-to-play-cascade': {
    en: howToPlayCascadeEn,
    es: howToPlayCascadeEs,
    fr: howToPlayCascadeFr,
    ru: howToPlayCascadeRu,
    by: howToPlayCascadeBy,
  },
  'how-to-play-glimworm': {
    en: howToPlayGlimwormEn,
    es: howToPlayGlimwormEs,
    fr: howToPlayGlimwormFr,
    ru: howToPlayGlimwormRu,
    by: howToPlayGlimwormBy,
  },
  'how-to-play-cat-dash': {
    en: howToPlayCatDashEn,
    es: howToPlayCatDashEs,
    fr: howToPlayCatDashFr,
    ru: howToPlayCatDashRu,
    by: howToPlayCatDashBy,
  },
  'how-to-play-pachisi': {
    en: howToPlayPachisiEn,
    es: howToPlayPachisiEs,
    fr: howToPlayPachisiFr,
    ru: howToPlayPachisiRu,
    by: howToPlayPachisiBy,
  },
  'platform-stats': {
    en: platformStatsEn,
  },
  'annotated-chess-replay': {
    en: annotatedChessReplayEn,
  },
  'climbing-ranked': {
    en: climbingRankedEn,
  },
  'patch-notes-v1-24': {
    en: patchNotesV124En,
  },
};

/** Canonical slugs for every published post, in stable order. */
export const POST_SLUGS = Object.keys(POSTS);

/**
 * Look up a single post by slug for a locale. Falls back to the default
 * locale if the requested locale is missing — better to serve the
 * English version than 404 a real piece of content, but we still emit
 * an hreflang chain so Google knows which URL is the canonical one for
 * each language.
 */
export function getPost(slug: string, locale: Locale): BlogPost | undefined {
  const byLocale = POSTS[slug];
  if (!byLocale) return undefined;
  return byLocale[locale] ?? byLocale[DEFAULT_LOCALE];
}

/**
 * All posts available for a locale, ordered by `publishedAt` descending.
 * Falls back to the default locale for slugs that have not been
 * translated yet, so the listing page always shows every published
 * piece of content rather than an inconsistent locale-dependent set.
 */
export function getPosts(locale: Locale): BlogPost[] {
  return POST_SLUGS.map((slug) => getPost(slug, locale))
    .filter((p): p is BlogPost => !!p)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * Posts whose tag list intersects any of the supplied tags. Used by the
 * "Related articles" block on game landing pages — the landing page
 * passes the localized + canonical tag aliases for its game and we
 * surface every post that matches at least one of them. Case-insensitive
 * so locale-translated tags (e.g. `Bataille navale`) still match.
 */
export function getPostsByTag(
  locale: Locale,
  tags: ReadonlyArray<string>,
  limit = 4,
): BlogPost[] {
  if (!tags.length) return [];
  const needles = tags.map((t) => t.toLowerCase());
  return getPosts(locale)
    .filter((p) => p.tags.some((tag) => needles.includes(tag.toLowerCase())))
    .slice(0, limit);
}
