import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { DEFAULT_LOCALE, type Locale } from '@/shared/i18n/types';
import { localeAlternates, localePath } from '@/shared/i18n/locale-url';

export type BuildMetadataInput = {
  /**
   * Page title without the brand suffix. The root layout's `template`
   * appends ` | <AppName>` automatically.
   */
  title?: string;
  description?: string;
  /**
   * Canonical path *without* locale prefix (e.g. `/games`). The helper
   * applies the active locale's prefix to produce a self-referencing
   * canonical and emits hreflang alternates for every supported locale.
   */
  path: string;
  /** Page-specific keywords merged with the global brand keyword set. */
  keywords?: string[];
  /** Override the OG/Twitter image. Defaults to `/logo.png`. */
  image?: string;
  /** Defaults to `website`; set `article` for blog posts, `profile` for users. */
  ogType?: 'website' | 'article' | 'profile';
  /** `false` for private / auth / transactional routes that must not be indexed. */
  index?: boolean;
  /**
   * Active locale for this request. Default-locale URLs are rootless,
   * others are prefixed (`/es/games`). When omitted falls back to the
   * default locale (useful for fully-static pages).
   */
  locale?: Locale;
};

const BASE_KEYWORDS = [
  'board games',
  'online board games',
  'play board games online',
  'tabletop games',
  'multiplayer board games',
  'free online board games',
  'online board game platform',
  appConfig.appName.toLowerCase(),
];

const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  ru: 'ru_RU',
  by: 'be_BY',
};

const ALTERNATE_OG_LOCALES: Record<Locale, string[]> = (() => {
  const all = Object.values(OG_LOCALE);
  return {
    en: all.filter((l) => l !== OG_LOCALE.en),
    es: all.filter((l) => l !== OG_LOCALE.es),
    fr: all.filter((l) => l !== OG_LOCALE.fr),
    ru: all.filter((l) => l !== OG_LOCALE.ru),
    by: all.filter((l) => l !== OG_LOCALE.by),
  };
})();

/**
 * Single source of truth for per-page metadata. Always sets canonical, OG,
 * Twitter, and hreflang alternates so social previews and search engines
 * see a consistent picture across all supported locales.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description = appConfig.seoDescription,
    path,
    keywords,
    image = '/logo.png',
    ogType = 'website',
    index = true,
    locale = DEFAULT_LOCALE,
  } = input;

  const canonicalPath = localePath(path, locale);
  const url = `${appConfig.siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`;
  const ogTitle = title
    ? `${title} | ${appConfig.appName}`
    : appConfig.seoTitle;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: localeAlternates(path),
    },
    keywords: keywords ? [...keywords, ...BASE_KEYWORDS] : undefined,
    openGraph: {
      type: ogType,
      locale: OG_LOCALE[locale],
      alternateLocale: ALTERNATE_OG_LOCALES[locale],
      url,
      siteName: appConfig.appName,
      title: ogTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title ? `${title} — ${appConfig.appName}` : appConfig.appName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  };

  if (!index) {
    metadata.robots = {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        'max-image-preview': 'none',
      },
    };
  }

  return metadata;
}
