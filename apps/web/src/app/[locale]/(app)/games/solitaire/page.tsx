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
import SolitaireLanding from './SolitaireLanding';

export const dynamic = 'force-static';

export const revalidate = 300;

const SOLITAIRE_SLUG = 'solitaire_v1';

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
  return buildPageMetadata({ locale, page: 'solitaireLanding' });
}

export default async function SolitaireLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const game = messages.games?.solitaire_v1;
  const landing = game?.landing;
  const rules = game?.rules;
  const gameName = game?.name ?? 'Solitaire';
  const description = game?.description ?? landing?.meta.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: SOLITAIRE_SLUG,
    slug: 'solitaire',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: 1,
    maxPlayers: 1,
    genre: 'Card Game',
    alternateName: ['Solitaire Online', 'Klondike Solitaire'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: {
      name: `How to Play Solitaire on ${appConfig.appName}`,
      description: 'Play Solitaire online free — no signup, no download.',
      steps: [
        {
          name: 'Start',
          text: 'Open the game and a new Klondike Solitaire deal starts immediately.',
        },
        {
          name: 'Play',
          text: 'Move cards between columns building down by alternating color.',
        },
        {
          name: 'Win',
          text: 'Sort all 52 cards onto the 4 foundation piles by suit to complete the game.',
        },
      ],
      totalTime: 'PT1M',
    },
    faqs: landing?.faq
      ? Object.values(landing.faq).map((f) => ({
          question: (f as { question: string; answer: string }).question,
          answer: (f as { question: string; answer: string }).answer,
        }))
      : undefined,
  });

  return (
    <>
      <JsonLd id="json-ld-solitaire" data={jsonLd} />
      <SolitaireLanding
        gameId={SOLITAIRE_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        playHref={routes.solitairePlay}
        rules={rules}
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, [
          'Solitaire',
          'Klondike',
          'Card Game',
          'Пасьянс',
        ])}
      />
    </>
  );
}
