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
import TicTacToeLanding from './TicTacToeLanding';

const TIC_TAC_TOE_SLUG = 'tic_tac_toe_v1';
const TIC_TAC_TOE_MIN_PLAYERS = 2;
const TIC_TAC_TOE_MAX_PLAYERS = 5;
const TIC_TAC_TOE_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'ticTacToeLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/tic-tac-toe/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Tic-Tac-Toe — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [
        `${appConfig.siteUrl}/${locale}/games/tic-tac-toe/opengraph-image`,
      ],
    },
  };
}

export default async function TicTacToeLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.tic_tac_toe_v1?.landing;
  const variants = messages.games?.tic_tac_toe_v1?.variants;
  const rules = messages.games?.tic_tac_toe_v1?.rules;
  const gameName = messages.games?.tic_tac_toe_v1?.name ?? 'Tic-Tac-Toe';
  const description =
    messages.games?.tic_tac_toe_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: TIC_TAC_TOE_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: TIC_TAC_TOE_MIN_PLAYERS,
      maxPlayers: TIC_TAC_TOE_MAX_PLAYERS,
      genre: TIC_TAC_TOE_GENRE,
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.ticTacToeLanding}`;

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
      <JsonLd id="json-ld-tic-tac-toe" data={jsonLd} />
      <TicTacToeLanding
        landing={landing}
        variants={variants}
        rules={rules}
        createRoomHref={`${routes.gameCreate}?gameId=${TIC_TAC_TOE_SLUG}`}
        roomsHref={routes.games}
        gamesHref={routes.games}
        homeHref={routes.home}
      />
    </>
  );
}
