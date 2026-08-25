import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { buildFaqJsonLd } from '@/shared/seo/faqJsonLd';
import { buildHowToJsonLd } from '@/shared/seo/howToJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import CatDashLanding from './CatDashLanding';
import { isGameComingSoon } from '@/features/games/api.server';

const CAT_DASH_SLUG = 'cat_dash_v1';
const CAT_DASH_MIN_PLAYERS = 2;
const CAT_DASH_MAX_PLAYERS = 6;
const CAT_DASH_GENRE = 'Race';

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
  const base = await buildPageMetadata({ locale, page: 'catDashLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/cat-dash/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Cat Dash — free multiplayer cat racing on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/cat-dash/opengraph-image`],
    },
  };
}

export default async function CatDashLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.cat_dash_v1?.landing;
  const variants = messages.games?.cat_dash_v1?.variants;
  const rules = messages.games?.cat_dash_v1?.rules;
  const gameName = messages.games?.cat_dash_v1?.name ?? 'Cat Dash';
  const description =
    messages.games?.cat_dash_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: CAT_DASH_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: CAT_DASH_MIN_PLAYERS,
      maxPlayers: CAT_DASH_MAX_PLAYERS,
      genre: CAT_DASH_GENRE,
      alternateName: ['Cat Dash Racing', 'Cat Race Online', 'Dice Cat Runner'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.catDashLanding}`;
  const comingSoon = await isGameComingSoon(CAT_DASH_SLUG);

  const faqItems = landing?.faq;
  if (faqItems) {
    const faqQuestions = Object.values(faqItems).map(
      (item: { question: string; answer: string }) => ({
        question: item.question,
        answer: item.answer,
      }),
    );
    const faqJsonLd = buildFaqJsonLd({
      locale,
      questions: faqQuestions,
      pageUrl,
      speakableSelectors: ['#faq'],
    });
    if (faqJsonLd) jsonLd.push(faqJsonLd);
  }

  const howToSteps = landing?.steps;
  if (howToSteps) {
    const howToJsonLd = buildHowToJsonLd({
      locale,
      pageUrl,
      name: `How to play ${gameName}`,
      description: description ?? '',
      steps: [howToSteps.create, howToSteps.join, howToSteps.play]
        .filter((s): s is { title: string; body: string } => s !== undefined)
        .map((s) => ({ name: s.title, text: s.body })),
    });
    if (howToJsonLd) jsonLd.push(howToJsonLd);
  }

  return (
    <>
      <JsonLd id="json-ld-cat-dash" data={jsonLd} />
      <CatDashLanding
        landing={landing}
        comingSoon={comingSoon}
        variants={variants}
        rules={rules}
        gameId={CAT_DASH_SLUG}
        createRoomHref={`${routes.gameCreate}?gameId=${CAT_DASH_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${CAT_DASH_SLUG}`}
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
          'Cat Dash',
          'Board Game',
          'Racing',
          'Гонки',
        ])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
