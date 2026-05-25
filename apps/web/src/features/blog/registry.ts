import type { Locale } from '@/shared/i18n';
import { DEFAULT_LOCALE } from '@/shared/i18n';
import type { BlogPost } from './types';

import { post as howToPlaySeaBattleEn } from './posts/how-to-play-sea-battle/en';
import { post as howToPlaySeaBattleEs } from './posts/how-to-play-sea-battle/es';
import { post as howToPlaySeaBattleFr } from './posts/how-to-play-sea-battle/fr';
import { post as howToPlaySeaBattleRu } from './posts/how-to-play-sea-battle/ru';
import { post as howToPlaySeaBattleBy } from './posts/how-to-play-sea-battle/by';

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
