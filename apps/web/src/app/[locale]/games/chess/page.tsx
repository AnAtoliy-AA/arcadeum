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
import ChessLanding from './ChessLanding';

const CHESS_SLUG = 'chess_v1';
const CHESS_MIN_PLAYERS = 2;
const CHESS_MAX_PLAYERS = 2;
const CHESS_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'chessLanding' });
  const messages = await getTranslations(locale);
  const landingMeta = messages.games?.chess_v1?.landing?.meta;
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/chess/opengraph-image`,
          width: 1200,
          height: 630,
          alt: landingMeta?.title ?? 'Chess — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/chess/opengraph-image`],
    },
  };
}

export default async function ChessLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.chess_v1?.landing;
  const rules = messages.games?.chess_v1?.rules;
  const gameName = messages.games?.chess_v1?.name ?? 'Chess';
  const description =
    messages.games?.chess_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: CHESS_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: CHESS_MIN_PLAYERS,
      maxPlayers: CHESS_MAX_PLAYERS,
      genre: CHESS_GENRE,
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.chessLanding}`;

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
      name: landing?.meta?.howToPlayTitle
        ? landing.meta.howToPlayTitle.replace(/\{\{gameName\}\}/g, gameName)
        : `How to play ${gameName}`,
      description: description ?? '',
      steps: [howToSteps.create, howToSteps.join, howToSteps.play]
        .filter((s): s is { title: string; body: string } => s !== undefined)
        .map((s) => ({ name: s.title, text: s.body })),
    });
    if (howToJsonLd) jsonLd.push(howToJsonLd);
  }

  return (
    <>
      <JsonLd id="json-ld-chess" data={jsonLd} />
      <ChessLanding
        landing={landing}
        rules={rules}
        gameId={CHESS_SLUG}
        roomsHref={routes.games}
        gamesHref={routes.games}
        homeHref={routes.home}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
      />
    </>
  );
}
