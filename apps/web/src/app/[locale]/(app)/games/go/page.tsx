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
import GoLanding from './GoLanding';
import { isGameComingSoon } from '@/features/games/api.server';

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

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: GO_SLUG,
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
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.goLanding ?? `/${locale}/games/go`}`;
  const comingSoon = await isGameComingSoon(GO_SLUG);

  const faqItems = landing?.faq;
  if (faqItems) {
    const faqQuestions = (
      Object.values(faqItems) as Array<{ question: string; answer: string }>
    ).map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
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
        .filter((s) => !!s?.title && !!s?.body)
        .map((s) => ({ name: s.title, text: s.body })),
    });
    if (howToJsonLd) jsonLd.push(howToJsonLd);
  }

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
    </>
  );
}
