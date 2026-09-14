import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildGameLandingJsonLd } from '@/shared/seo/buildGameLandingJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import CascadeLanding from './CascadeLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

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
          url: `${appConfig.siteUrl}/${locale}/games/cascade/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Cascade — multiplayer shedding card game on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/cascade/opengraph-image`],
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

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: CASCADE_SLUG,
    slug: 'cascade',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: CASCADE_MIN_PLAYERS,
    maxPlayers: CASCADE_MAX_PLAYERS,
    genre: CASCADE_GENRE,
    alternateName: [
      'Cascade Cards',
      'Crazy Eights Online',
      'Color Match Cards',
    ],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Cascade on ${appConfig.appName}`,
          description:
            'Play Cascade online — a fun card game for 2 to 10 players.',
          steps: [
            {
              name: landing.steps?.create?.title ?? 'Create a room',
              text:
                landing.steps?.create?.body ??
                'Create a room and pick a theme.',
            },
            {
              name: landing.steps?.join?.title ?? 'Invite',
              text: landing.steps?.join?.body ?? 'Share the link with friends.',
            },
            {
              name: landing.steps?.play?.title ?? 'Play',
              text:
                landing.steps?.play?.body ??
                'Play cards and use action cards to outmaneuver opponents.',
            },
          ],
          totalTime: 'PT2M',
        }
      : undefined,
    faqs: landing?.faq
      ? Object.values(landing.faq).map((f) => ({
          question: (f as { question: string; answer: string }).question,
          answer: (f as { question: string; answer: string }).answer,
        }))
      : undefined,
  });

  const comingSoon = await isGameComingSoon(CASCADE_SLUG);

  return (
    <>
      <JsonLd id="json-ld-cascade" data={jsonLd} />
      <CascadeLanding
        landing={landing}
        comingSoon={comingSoon}
        variants={variants}
        rules={rules}
        gameId={CASCADE_SLUG}
        createRoomHref={`${routes.gameCreate}?gameId=${CASCADE_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${CASCADE_SLUG}`}
        gamesHref={routes.games}
        homeHref={routes.home}
        homeLabel={messages.navigation?.homeTab ?? 'Home'}
        gamesLabel={messages.navigation?.gamesTab ?? 'Games'}
        backToGamesLabel={
          messages.games?.cascade_v1?.board?.backToGames ?? 'All Games'
        }
        locale={locale}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, ['Cascade', 'Card Game', 'Каскад'])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
