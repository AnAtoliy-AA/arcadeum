import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  localeToHreflang,
  type Locale,
} from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import type { SeoMessages } from '@/shared/i18n/messages/seo/en';

/**
 * Identifier for a page's SEO copy. Must match a key in the `seo`
 * translation namespace.
 */
export type SeoPageKey = keyof SeoMessages;

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  ru: 'ru_RU',
  by: 'be_BY',
};

/**
 * Resolve the locale-prefixed path for the given SEO page key. Most pages
 * map 1:1 to a property on `buildRoutes(locale)`; pass an explicit
 * `pathFor(routes)` builder to override (dynamic routes, query strings).
 */
type PathBuilder = (routes: ReturnType<typeof buildRoutes>) => string;

const DEFAULT_PATH_BUILDERS: Partial<Record<SeoPageKey, PathBuilder>> = {
  home: (r) => r.home,
  games: (r) => r.games,
  rooms: (r) => r.rooms,
  gameCreate: (r) => r.gameCreate,
  seaBattleLanding: (r) => r.seaBattleLanding,
  criticalLanding: (r) => r.criticalLanding,
  glimwormLanding: (r) => r.glimwormLanding,
  ticTacToeLanding: (r) => r.ticTacToeLanding,
  cascadeLanding: (r) => r.cascadeLanding,
  chessLanding: (r) => r.chessLanding,
  checkersLanding: (r) => r.checkersLanding,
  catDashLanding: (r) => r.catDashLanding,
  backgammonLanding: (r) => r.backgammonLanding,
  pachisiLanding: (r) => r.pachisiLanding,
  heartsLanding: (r) => r.heartsLanding,
  spadesLanding: (r) => r.spadesLanding,
  goLanding: (r) => r.goLanding,
  solitaireLanding: (r) => r.solitaireLanding,
  minesweeperLanding: (r) => r.minesweeperLanding,
  sudokuLanding: (r) => r.sudokuLanding,
  game2048Landing: (r) => r.game2048Landing,
  settings: (r) => r.settings,
  history: (r) => r.history,
  stats: (r) => r.stats,
  referrals: (r) => r.referrals,
  leaderboards: (r) => r.leaderboards,
  friends: (r) => r.friends,
  clans: (r) => r.clans,
  events: (r) => r.events,
  tournaments: (r) => r.tournaments,
  rewards: (r) => r.rewards,
  wallet: (r) => r.wallet,
  token: (r) => r.token,
  shop: (r) => r.shop,
  payment: (r) => r.payment,
  paymentSuccess: (r) => r.paymentSuccess,
  paymentCancel: (r) => r.paymentCancel,
  notes: (r) => r.notes,
  chats: (r) => r.chats,
  chat: (r) => r.chat,
  auth: (r) => r.auth,
  support: (r) => r.support,
  contact: (r) => r.contact,
  help: (r) => r.help,
  terms: (r) => r.terms,
  privacy: (r) => r.privacy,
  cookies: (r) => r.cookies,
  blog: (r) => r.blog,
  community: (r) => r.community,
  developers: (r) => r.developers,
  admin: (r) => r.admin,
  // playerProfile is dynamic — callers must pass `pathFor`, but we map it
  // here to the locale root so hreflang at least covers all locales.
  playerProfile: (r) => r.home,
  notFound: (r) => r.home,
};

export interface BuildPageMetadataOptions {
  /** Active locale (from `params.locale`). */
  locale: Locale;
  /** Page identifier — must exist in the `seo` translations. */
  page: SeoPageKey;
  /**
   * Optional override producing the page's path under each locale. Use for
   * dynamic routes (game detail, room id, …) where the path isn't 1:1 with
   * a static route entry.
   */
  pathFor?: PathBuilder;
  /** Optional title override (skips translation lookup). */
  title?: string;
  /** Optional description override (skips translation lookup). */
  description?: string;
  /** Set `robots.index` / `robots.follow` to false on admin / internal pages. */
  noIndex?: boolean;
}

/**
 * Produce localized `Metadata` for a page in the `[locale]` segment.
 *
 * - title / description come from the active locale's `seo` namespace,
 *   with the English bundle as fallback.
 * - canonical points at the active-locale URL for this page.
 * - alternates.languages emits hreflang for every supported locale plus
 *   `x-default` (English).
 * - openGraph carries locale-aware title/description/locale + url.
 */
export async function buildPageMetadata({
  locale,
  page,
  pathFor,
  title: titleOverride,
  description: descriptionOverride,
  noIndex,
}: BuildPageMetadataOptions): Promise<Metadata> {
  const resolvePath = pathFor ?? DEFAULT_PATH_BUILDERS[page];
  if (!resolvePath) {
    throw new Error(
      `buildPageMetadata: no path builder for page "${page}". Pass \`pathFor\` explicitly.`,
    );
  }

  const messages = await getTranslations(locale);
  const seo = messages.seo;
  const copy = seo?.[page];

  // Fall back to English copy if the active locale hasn't been translated
  // yet (DeepPartial allows undefined per field).
  const fallback =
    locale === DEFAULT_LOCALE
      ? undefined
      : (await getTranslations(DEFAULT_LOCALE)).seo?.[page];

  const title = titleOverride ?? copy?.title ?? fallback?.title;
  const description =
    descriptionOverride ?? copy?.description ?? fallback?.description;

  const path = resolvePath(buildRoutes(locale));
  const canonical = `${appConfig.siteUrl}${path}`;
  // Locale-branded 1200×630 fallback card (see `app/[locale]/opengraph-image.tsx`).
  // Page-level metadata replaces (not merges) the layout's openGraph, so every
  // page must carry its own image or shares render without one.
  const ogImage = {
    url: `${appConfig.siteUrl}/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: title ?? appConfig.appName,
  };
  const languages: Record<string, string> = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => {
      const localePath = resolvePath(buildRoutes(l));
      return [localeToHreflang(l), `${appConfig.siteUrl}${localePath}`];
    }),
  );
  languages['x-default'] = `${appConfig.siteUrl}${resolvePath(
    buildRoutes(DEFAULT_LOCALE),
  )}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale],
      // og:locale:alternate — Facebook/Discord use these to pick the right
      // unfurl when the same URL is shared in a different locale context.
      // Complements `alternates.languages` (hreflang).
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE_MAP[l],
      ),
      siteName: appConfig.appName,
      title,
      description,
      url: canonical,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@_arcadeum_',
      title,
      description,
      images: [ogImage.url],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : undefined),
  };
}
