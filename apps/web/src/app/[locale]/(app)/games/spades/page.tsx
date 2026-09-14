import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildGameLandingJsonLd } from '@/shared/seo/buildGameLandingJsonLd';
import SpadesLanding from './SpadesLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const SPADES_SLUG = 'spades_v1';
const SPADES_MIN_PLAYERS = 4;
const SPADES_MAX_PLAYERS = 4;
const SPADES_GENRE = 'Card Game';

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
  const base = await buildPageMetadata({ locale, page: 'spadesLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/spades/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Spades — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/spades/opengraph-image`],
    },
  };
}

export default async function SpadesLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.spades_v1?.landing;
  const rules = messages.games?.spades_v1?.rules;
  const gameName = messages.games?.spades_v1?.name ?? 'Spades';
  const description =
    messages.games?.spades_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: SPADES_SLUG,
    slug: 'spades',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: SPADES_MIN_PLAYERS,
    maxPlayers: SPADES_MAX_PLAYERS,
    genre: SPADES_GENRE,
    alternateName: ['Spades Card Game', 'Spades Online'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Spades on ${appConfig.appName}`,
          description:
            'Play Spades online with 4 players — no download or signup required.',
          steps: [
            {
              name: landing.steps.create.title ?? 'Create a room',
              text:
                landing.steps.create.body ??
                'Set up a Spades room and choose your visual theme.',
            },
            {
              name: landing.steps.join.title ?? 'Invite friends',
              text:
                landing.steps.join.body ??
                'Share the link with 3 friends or wait for Quick Play matchmaking.',
            },
            {
              name: landing.steps.play.title ?? 'Play',
              text:
                landing.steps.play.body ??
                'Bid on tricks and score points by making your contract.',
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

  const comingSoon = await isGameComingSoon(SPADES_SLUG);

  return (
    <>
      <JsonLd id="json-ld-spades" data={jsonLd} />
      <SpadesLanding
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${SPADES_SLUG}`}
        gameId={SPADES_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        roomsHref={`${routes.rooms}?gameId=${SPADES_SLUG}`}
        rules={rules}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
    </>
  );
}
