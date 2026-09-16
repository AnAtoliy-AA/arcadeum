import type { Locale } from '@/shared/i18n';
import { DEFAULT_LOCALE } from '@/shared/i18n';
import type { BlogPost } from './types';

/**
 * Slug → locale → file path mapping.  Posts are loaded on demand via
 * dynamic `import()` so only the modules actually needed for the current
 * request are bundled into the server chunk.
 */
const POST_MANIFEST: Record<
  string,
  Partial<Record<Locale, () => Promise<{ post: BlogPost }>>>
> = {
  'sea-battle-best-strategies-and-placements': {
    en: () => import('./posts/sea-battle-best-strategies-and-placements/en'),
    es: () => import('./posts/sea-battle-best-strategies-and-placements/es'),
    fr: () => import('./posts/sea-battle-best-strategies-and-placements/fr'),
    ru: () => import('./posts/sea-battle-best-strategies-and-placements/ru'),
    by: () => import('./posts/sea-battle-best-strategies-and-placements/by'),
  },
  'how-to-play-sea-battle': {
    en: () => import('./posts/how-to-play-sea-battle/en'),
    es: () => import('./posts/how-to-play-sea-battle/es'),
    fr: () => import('./posts/how-to-play-sea-battle/fr'),
    ru: () => import('./posts/how-to-play-sea-battle/ru'),
    by: () => import('./posts/how-to-play-sea-battle/by'),
  },
  'how-to-play-chess': {
    en: () => import('./posts/how-to-play-chess/en'),
    es: () => import('./posts/how-to-play-chess/es'),
    fr: () => import('./posts/how-to-play-chess/fr'),
    ru: () => import('./posts/how-to-play-chess/ru'),
    by: () => import('./posts/how-to-play-chess/by'),
  },
  'how-to-play-checkers': {
    en: () => import('./posts/how-to-play-checkers/en'),
    es: () => import('./posts/how-to-play-checkers/es'),
    fr: () => import('./posts/how-to-play-checkers/fr'),
    ru: () => import('./posts/how-to-play-checkers/ru'),
    by: () => import('./posts/how-to-play-checkers/by'),
  },
  'how-to-play-backgammon': {
    en: () => import('./posts/how-to-play-backgammon/en'),
    es: () => import('./posts/how-to-play-backgammon/es'),
    fr: () => import('./posts/how-to-play-backgammon/fr'),
    ru: () => import('./posts/how-to-play-backgammon/ru'),
    by: () => import('./posts/how-to-play-backgammon/by'),
  },
  'how-to-play-hearts': {
    en: () => import('./posts/how-to-play-hearts/en'),
    es: () => import('./posts/how-to-play-hearts/es'),
    fr: () => import('./posts/how-to-play-hearts/fr'),
    ru: () => import('./posts/how-to-play-hearts/ru'),
    by: () => import('./posts/how-to-play-hearts/by'),
  },
  'how-to-play-spades': {
    en: () => import('./posts/how-to-play-spades/en'),
    es: () => import('./posts/how-to-play-spades/es'),
    fr: () => import('./posts/how-to-play-spades/fr'),
    ru: () => import('./posts/how-to-play-spades/ru'),
    by: () => import('./posts/how-to-play-spades/by'),
  },
  'how-to-play-solitaire': {
    en: () => import('./posts/how-to-play-solitaire/en'),
    es: () => import('./posts/how-to-play-solitaire/es'),
    fr: () => import('./posts/how-to-play-solitaire/fr'),
    ru: () => import('./posts/how-to-play-solitaire/ru'),
    by: () => import('./posts/how-to-play-solitaire/by'),
  },
  'how-to-play-minesweeper': {
    en: () => import('./posts/how-to-play-minesweeper/en'),
    es: () => import('./posts/how-to-play-minesweeper/es'),
    fr: () => import('./posts/how-to-play-minesweeper/fr'),
    ru: () => import('./posts/how-to-play-minesweeper/ru'),
    by: () => import('./posts/how-to-play-minesweeper/by'),
  },
  'how-to-play-sudoku': {
    en: () => import('./posts/how-to-play-sudoku/en'),
    es: () => import('./posts/how-to-play-sudoku/es'),
    fr: () => import('./posts/how-to-play-sudoku/fr'),
    ru: () => import('./posts/how-to-play-sudoku/ru'),
    by: () => import('./posts/how-to-play-sudoku/by'),
  },
  'how-to-win-2048': {
    en: () => import('./posts/how-to-win-2048/en'),
    es: () => import('./posts/how-to-win-2048/es'),
    fr: () => import('./posts/how-to-win-2048/fr'),
    ru: () => import('./posts/how-to-win-2048/ru'),
    by: () => import('./posts/how-to-win-2048/by'),
  },
  'how-to-win-tic-tac-toe': {
    en: () => import('./posts/how-to-win-tic-tac-toe/en'),
    es: () => import('./posts/how-to-win-tic-tac-toe/es'),
    fr: () => import('./posts/how-to-win-tic-tac-toe/fr'),
    ru: () => import('./posts/how-to-win-tic-tac-toe/ru'),
    by: () => import('./posts/how-to-win-tic-tac-toe/by'),
  },
  'how-to-play-go': {
    en: () => import('./posts/how-to-play-go/en'),
    es: () => import('./posts/how-to-play-go/es'),
    fr: () => import('./posts/how-to-play-go/fr'),
    ru: () => import('./posts/how-to-play-go/ru'),
    by: () => import('./posts/how-to-play-go/by'),
  },
  'how-to-play-critical': {
    en: () => import('./posts/how-to-play-critical/en'),
    es: () => import('./posts/how-to-play-critical/es'),
    fr: () => import('./posts/how-to-play-critical/fr'),
    ru: () => import('./posts/how-to-play-critical/ru'),
    by: () => import('./posts/how-to-play-critical/by'),
  },
  'how-to-play-cascade': {
    en: () => import('./posts/how-to-play-cascade/en'),
    es: () => import('./posts/how-to-play-cascade/es'),
    fr: () => import('./posts/how-to-play-cascade/fr'),
    ru: () => import('./posts/how-to-play-cascade/ru'),
    by: () => import('./posts/how-to-play-cascade/by'),
  },
  'how-to-play-glimworm': {
    en: () => import('./posts/how-to-play-glimworm/en'),
    es: () => import('./posts/how-to-play-glimworm/es'),
    fr: () => import('./posts/how-to-play-glimworm/fr'),
    ru: () => import('./posts/how-to-play-glimworm/ru'),
    by: () => import('./posts/how-to-play-glimworm/by'),
  },
  'how-to-play-cat-dash': {
    en: () => import('./posts/how-to-play-cat-dash/en'),
    es: () => import('./posts/how-to-play-cat-dash/es'),
    fr: () => import('./posts/how-to-play-cat-dash/fr'),
    ru: () => import('./posts/how-to-play-cat-dash/ru'),
    by: () => import('./posts/how-to-play-cat-dash/by'),
  },
  'how-to-play-pachisi': {
    en: () => import('./posts/how-to-play-pachisi/en'),
    es: () => import('./posts/how-to-play-pachisi/es'),
    fr: () => import('./posts/how-to-play-pachisi/fr'),
    ru: () => import('./posts/how-to-play-pachisi/ru'),
    by: () => import('./posts/how-to-play-pachisi/by'),
  },
  'platform-stats': {
    en: () => import('./posts/platform-stats/en'),
  },
  'annotated-chess-replay': {
    en: () => import('./posts/annotated-chess-replay/en'),
  },
  'climbing-ranked': {
    en: () => import('./posts/climbing-ranked/en'),
  },
  'patch-notes-v1-24': {
    en: () => import('./posts/patch-notes-v1-24/en'),
  },
};

/** Canonical slugs for every published post, in stable order. */
export const POST_SLUGS = Object.keys(POST_MANIFEST);

/**
 * Look up a single post by slug for a locale. Falls back to the default
 * locale if the requested locale is missing — better to serve the
 * English version than 404 a real piece of content, but we still emit
 * an hreflang chain so Google knows which URL is the canonical one for
 * each language.
 */
export async function getPost(
  slug: string,
  locale: Locale,
): Promise<BlogPost | undefined> {
  const byLocale = POST_MANIFEST[slug];
  if (!byLocale) return undefined;
  const loader = byLocale[locale] ?? byLocale[DEFAULT_LOCALE];
  if (!loader) return undefined;
  const mod = await loader();
  return mod.post;
}

/**
 * All posts available for a locale, ordered by `publishedAt` descending.
 * Falls back to the default locale for slugs that have not been
 * translated yet, so the listing page always shows every published
 * piece of content rather than an inconsistent locale-dependent set.
 */
export async function getPosts(locale: Locale): Promise<BlogPost[]> {
  const posts = await Promise.all(
    POST_SLUGS.map((slug) => getPost(slug, locale)),
  );
  return posts
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
export async function getPostsByTag(
  locale: Locale,
  tags: ReadonlyArray<string>,
  limit = 4,
): Promise<BlogPost[]> {
  if (!tags.length) return [];
  const needles = tags.map((t) => t.toLowerCase());
  const all = await getPosts(locale);
  return all
    .filter((p) => p.tags.some((tag) => needles.includes(tag.toLowerCase())))
    .slice(0, limit);
}
