import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

interface BuildVideoGameJsonLdInput {
  gameId: string;
  gameName: string;
  description?: string;
  /** Minimum number of players supported (defaults to 2). */
  minPlayers?: number;
  /** Maximum number of players supported (defaults to 6). */
  maxPlayers?: number;
  /** Genre/category (defaults to "Strategy"). */
  genre?: string;
  /** Alternate names for SEO (e.g. ["Battleship", "Sea Battle Online"]). */
  alternateName?: string[];
  /** Locale to render breadcrumbs in. */
  locale: Locale;
  /** Display strings for the breadcrumb. */
  breadcrumb: {
    home: string;
    games: string;
    game: string;
  };
}

/**
 * Build a VideoGame + BreadcrumbList structured data block for a game
 * detail page. Matches the schema Google uses to render game rich
 * results in SERPs.
 */
export function buildVideoGameJsonLd({
  gameId,
  gameName,
  description,
  minPlayers = 2,
  maxPlayers = 6,
  genre = 'Strategy',
  alternateName,
  locale,
  breadcrumb,
}: BuildVideoGameJsonLdInput): Record<string, unknown>[] {
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.gameDetail(gameId)}`;
  const image = `${appConfig.siteUrl}/logo.png`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: gameName,
      alternateName,
      description,
      url: pageUrl,
      image,
      genre,
      gamePlatform: ['Web Browser'],
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
      playMode: ['MultiPlayer', 'SinglePlayer'],
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: minPlayers,
        maxValue: maxPlayers,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: appConfig.appName,
        url: appConfig.siteUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumb.home,
          item: `${appConfig.siteUrl}${routes.home}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumb.games,
          item: `${appConfig.siteUrl}${routes.games}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: breadcrumb.game,
          item: pageUrl,
        },
      ],
    },
  ];
}
