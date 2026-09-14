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
import CheckersLanding from './CheckersLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const CHECKERS_SLUG = 'checkers_v1';
const CHECKERS_MIN_PLAYERS = 2;
const CHECKERS_MAX_PLAYERS = 2;
const CHECKERS_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'checkersLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/checkers/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Checkers — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/checkers/opengraph-image`],
    },
  };
}

export default async function CheckersLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.checkers_v1?.landing;
  const variants = messages.games?.checkers_v1?.variants;
  const rules = messages.games?.checkers_v1?.rules;
  const gameName = messages.games?.checkers_v1?.name ?? 'Checkers';
  const description =
    messages.games?.checkers_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: CHECKERS_SLUG,
    slug: 'checkers',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: CHECKERS_MIN_PLAYERS,
    maxPlayers: CHECKERS_MAX_PLAYERS,
    genre: CHECKERS_GENRE,
    alternateName: ['Draughts', 'Checkers Online', 'American Checkers'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Checkers on ${appConfig.appName}`,
          description:
            'Start a checkers match in seconds — no download or signup required.',
          steps: [
            {
              name: landing.steps.create.title ?? 'Create a room',
              text:
                landing.steps.create.body ??
                'Choose your theme and set up a private or public room.',
            },
            {
              name: landing.steps.join.title ?? 'Invite a friend',
              text:
                landing.steps.join.body ??
                'Share the room link or use Quick Play to get matched.',
            },
            {
              name: landing.steps.play.title ?? 'Play',
              text:
                landing.steps.play.body ??
                'Capture all opponent pieces to win.',
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

  const comingSoon = await isGameComingSoon(CHECKERS_SLUG);

  return (
    <>
      <JsonLd id="json-ld-checkers" data={jsonLd} />
      <CheckersLanding
        landing={landing}
        comingSoon={comingSoon}
        variants={variants}
        rules={rules}
        gameId={CHECKERS_SLUG}
        createRoomHref={`${routes.gameCreate}?gameId=${CHECKERS_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${CHECKERS_SLUG}`}
        gamesHref={routes.games}
        homeHref={routes.home}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, [
          'Checkers',
          'Draughts',
          'Шашки',
          'Шашкі',
          'Dames',
        ])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
