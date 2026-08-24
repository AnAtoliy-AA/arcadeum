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
import PachisiLanding from './PachisiLanding';
import { isGameComingSoon } from '@/features/games/api.server';

const PACHISI_SLUG = 'pachisi_v1';
const PACHISI_MIN_PLAYERS = 2;
const PACHISI_MAX_PLAYERS = 4;
const PACHISI_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'pachisiLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/pachisi/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Pachisi — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/pachisi/opengraph-image`],
    },
  };
}

export default async function PachisiLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.pachisi_v1?.landing;
  const rules = messages.games?.pachisi_v1?.rules;
  const gameName = messages.games?.pachisi_v1?.name ?? 'Pachisi';
  const description =
    messages.games?.pachisi_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: PACHISI_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: PACHISI_MIN_PLAYERS,
      maxPlayers: PACHISI_MAX_PLAYERS,
      genre: PACHISI_GENRE,
      alternateName: ['Ludo', 'Parcheesi', 'Pachisi Online'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.pachisiLanding ?? `/${locale}/games/pachisi`}`;
  const comingSoon = await isGameComingSoon(PACHISI_SLUG);

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
        .filter((s): s is { title: string; body: string } => s !== undefined)
        .map((s) => ({ name: s.title, text: s.body })),
    });
    if (howToJsonLd) jsonLd.push(howToJsonLd);
  }

  return (
    <>
      <JsonLd id="json-ld-pachisi" data={jsonLd} />
      <PachisiLanding
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${PACHISI_SLUG}`}
        gameId={PACHISI_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        roomsHref={`${routes.rooms}?gameId=${PACHISI_SLUG}`}
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
