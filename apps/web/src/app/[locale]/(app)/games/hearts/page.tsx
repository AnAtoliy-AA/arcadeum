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
import HeartsLanding from './HeartsLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const HEARTS_SLUG = 'hearts_v1';
const HEARTS_MIN_PLAYERS = 4;
const HEARTS_MAX_PLAYERS = 4;
const HEARTS_GENRE = 'Card Game';

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
  const base = await buildPageMetadata({ locale, page: 'heartsLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/hearts/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Hearts — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/hearts/opengraph-image`],
    },
  };
}

export default async function HeartsLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.hearts_v1?.landing;
  const rules = messages.games?.hearts_v1?.rules;
  const gameName = messages.games?.hearts_v1?.name ?? 'Hearts';
  const description =
    messages.games?.hearts_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: HEARTS_SLUG,
    slug: 'hearts',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: HEARTS_MIN_PLAYERS,
    maxPlayers: HEARTS_MAX_PLAYERS,
    genre: HEARTS_GENRE,
    alternateName: ['Hearts Card Game', 'Hearts Online'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Hearts on ${appConfig.appName}`,
          description:
            'Play Hearts card game online with 4 players — no download or signup needed.',
          steps: [
            {
              name: landing.steps.create.title ?? 'Create a room',
              text:
                landing.steps.create.body ??
                'Set up a Hearts room and choose your visual theme.',
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
                'Avoid taking hearts and the Queen of Spades to win.',
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

  const comingSoon = await isGameComingSoon(HEARTS_SLUG);

  return (
    <>
      <JsonLd id="json-ld-hearts" data={jsonLd} />
      <HeartsLanding
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${HEARTS_SLUG}`}
        gameId={HEARTS_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        roomsHref={`${routes.rooms}?gameId=${HEARTS_SLUG}`}
        rules={rules}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, ['Hearts', 'Card Game', 'Валетныя'])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
