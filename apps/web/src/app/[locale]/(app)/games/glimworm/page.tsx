import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildHowToJsonLd } from '@/shared/seo/howToJsonLd';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { buildFaqJsonLd } from '@/shared/seo/faqJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import { GlimwormLandingView } from './GlimwormLandingView';

const GLIMWORM_SLUG = 'glimworm_v1';
const GLIMWORM_MIN_PLAYERS = 2;
const GLIMWORM_MAX_PLAYERS = 10;
const GLIMWORM_GENRE = 'Action';

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
  const messages = await getTranslations(locale);
  const t = messages.games?.glimworm_v1?.landing?.meta;

  const base = await buildPageMetadata({
    locale,
    page: 'glimwormLanding',
    title: t?.title,
    description: t?.description,
  });

  return {
    ...base,
    keywords: t?.keywords,
    openGraph: {
      ...base.openGraph,
      title: t?.ogTitle ?? t?.title ?? base.openGraph?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.openGraph?.description,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/glimworm/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Glimworm — real-time multiplayer game on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      title: t?.ogTitle ?? t?.title ?? base.twitter?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.twitter?.description,
      images: [`${appConfig.siteUrl}/${locale}/games/glimworm/opengraph-image`],
    },
  };
}

export default async function GlimwormLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.glimwormLanding}`;
  const messages = await getTranslations(locale);
  const landing = messages.games?.glimworm_v1?.landing;
  const gameName = messages.games?.glimworm_v1?.name ?? 'Glimworm';
  const description = landing?.meta?.description ?? '';

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: GLIMWORM_SLUG,
      gameName,
      description,
      locale,
      minPlayers: GLIMWORM_MIN_PLAYERS,
      maxPlayers: GLIMWORM_MAX_PLAYERS,
      genre: GLIMWORM_GENRE,
      alternateName: [
        'Glimworm Online',
        'Glow Snake Arena',
        'Neon Snake Multiplayer',
      ],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const faqItems = landing?.faq?.items;
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

  const howToSteps = landing?.howToPlay?.steps;
  if (howToSteps) {
    const howToJsonLd = buildHowToJsonLd({
      locale,
      pageUrl,
      name: landing?.howToPlay?.title ?? `How to play ${gameName}`,
      description,
      steps: [
        howToSteps.setup,
        howToSteps.slither,
        howToSteps.evade,
        howToSteps.survive,
      ]
        .filter((s): s is { title: string; body: string } => !!s)
        .map((s) => ({ name: s.title, text: s.body })),
    });
    if (howToJsonLd) jsonLd.push(howToJsonLd);
  }

  const relatedPosts = getPostsByTag(locale, ['Glimworm', 'Snake', 'Arcade']);

  return (
    <>
      <JsonLd id="json-ld-glimworm" data={jsonLd} />
      <GlimwormLandingView
        landing={landing}
        gameId={GLIMWORM_SLUG}
        roomsHref={routes.gameDetail(GLIMWORM_SLUG)}
        createRoomHref={`${routes.gameCreate}?gameId=${GLIMWORM_SLUG}`}
        homeHref={routes.home}
        gamesHref={routes.games}
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
        posts={relatedPosts}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
