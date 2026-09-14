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
import GoLanding from './GoLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const GO_SLUG = 'go_v1';
const GO_MIN_PLAYERS = 2;
const GO_MAX_PLAYERS = 2;
const GO_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'goLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/go/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Go — free multiplayer board game on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/go/opengraph-image`],
    },
  };
}

export default async function GoLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.go_v1?.landing;
  const rules = messages.games?.go_v1?.rules;
  const gameName = messages.games?.go_v1?.name ?? 'Go';
  const description =
    messages.games?.go_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: GO_SLUG,
    slug: 'go',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: GO_MIN_PLAYERS,
    maxPlayers: GO_MAX_PLAYERS,
    genre: GO_GENRE,
    alternateName: ['Baduk', 'Weiqi', 'Igo', 'Go Online'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Go on ${appConfig.appName}`,
          description:
            'Play Go (Baduk/Weiqi) in your browser — no download, no signup.',
          steps: [
            {
              name: landing.steps.create.title ?? 'Create a room',
              text:
                landing.steps.create.body ??
                'Select board size (9×9, 13×13, or 19×19) and create a room.',
            },
            {
              name: landing.steps.join.title ?? 'Invite a friend',
              text:
                landing.steps.join.body ??
                'Share the room link with your opponent.',
            },
            {
              name: landing.steps.play.title ?? 'Play',
              text:
                landing.steps.play.body ??
                'Place stones to surround territory and capture opponent stones.',
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

  const comingSoon = await isGameComingSoon(GO_SLUG);

  return (
    <>
      <JsonLd id="json-ld-go" data={jsonLd} />
      <GoLanding
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${GO_SLUG}`}
        gameId={GO_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        roomsHref={`${routes.rooms}?gameId=${GO_SLUG}`}
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
        posts={getPostsByTag(locale, [
          'Go',
          'Baduk',
          'Weiqi',
          'Board Game',
          'Го',
        ])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
