import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

const SCHEMA_LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
};

interface CollectionItem {
  /** Display name shown in the rich-result snippet. */
  name: string;
  /** Locale-prefixed URL (e.g. `routes.gameDetail('critical_v1')`). */
  url: string;
  /** Optional thumbnail/preview image (absolute URL). */
  image?: string;
  /** Optional short description. */
  description?: string;
  /** Schema.org @type for the item. Defaults to 'Thing'. */
  itemType?: string;
}

/**
 * Build a schema.org CollectionPage with an inline ItemList for
 * catalog-style pages (games index, leaderboards, shop, blog,
 * tournaments). Signals to Google that the page is a curated list
 * rather than article-like content.
 */
export function buildCollectionPageJsonLd({
  locale,
  pageUrl,
  name,
  description,
  items,
}: {
  locale: Locale;
  /** Absolute or path-relative URL of the page itself. */
  pageUrl: string;
  /** Localized page title (used as CollectionPage.name). */
  name: string;
  /** Localized page description. */
  description?: string;
  items: CollectionItem[];
}): Record<string, unknown> {
  const fullPageUrl = pageUrl.startsWith('http')
    ? pageUrl
    : `${appConfig.siteUrl}${pageUrl}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: fullPageUrl,
    inLanguage: SCHEMA_LANGUAGE_MAP[locale],
    isPartOf: {
      '@type': 'WebSite',
      name: appConfig.appName,
      url: `${appConfig.siteUrl}${buildRoutes(locale).home}`,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, idx) => {
        const itemUrl = item.url.startsWith('http')
          ? item.url
          : `${appConfig.siteUrl}${item.url}`;
        return {
          '@type': 'ListItem',
          position: idx + 1,
          url: itemUrl,
          item: {
            '@type': (item.itemType as string) ?? 'Thing',
            name: item.name,
            url: itemUrl,
            ...(item.description ? { description: item.description } : {}),
            ...(item.image ? { image: item.image } : {}),
          },
        };
      }),
    },
  };
}
