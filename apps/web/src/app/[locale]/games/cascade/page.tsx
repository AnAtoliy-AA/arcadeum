import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import CascadeLanding from './CascadeLanding';

void appConfig;
const CASCADE_SLUG = 'cascade_v1';
const CASCADE_MIN_PLAYERS = 2;
const CASCADE_MAX_PLAYERS = 10;
const CASCADE_GENRE = 'Card Game';

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const base = await buildPageMetadata({ locale, page: 'cascadeLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `/${locale}/games/cascade/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Cascade — multiplayer shedding card game on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`/${locale}/games/cascade/opengraph-image`],
    },
  };
}

export default async function CascadeLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.cascade_v1?.landing;
  const variants = messages.games?.cascade_v1?.variants;
  const rules = messages.games?.cascade_v1?.rules;
  const gameName = messages.games?.cascade_v1?.name ?? 'Cascade';
  const description =
    messages.games?.cascade_v1?.description ?? landing?.meta?.description;

  const jsonLd = buildVideoGameJsonLd({
    gameId: CASCADE_SLUG,
    gameName,
    description: description ?? '',
    locale,
    minPlayers: CASCADE_MIN_PLAYERS,
    maxPlayers: CASCADE_MAX_PLAYERS,
    genre: CASCADE_GENRE,
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
      game: gameName,
    },
  });

  return (
    <>
      <JsonLd id="json-ld-cascade" data={jsonLd} />
      <CascadeLanding
        landing={landing}
        variants={variants}
        rules={rules}
        createRoomHref={`${routes.gameCreate}?gameId=${CASCADE_SLUG}`}
        roomsHref={routes.games}
        gamesHref={routes.games}
        homeHref={routes.home}
      />
    </>
  );
}
