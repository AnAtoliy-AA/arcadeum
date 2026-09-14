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
import MinesweeperLanding from './MinesweeperLanding';

export const dynamic = 'force-static';

export const revalidate = 300;

const MINESWEEPER_SLUG = 'minesweeper_v1';

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
  return buildPageMetadata({ locale, page: 'minesweeperLanding' });
}

export default async function MinesweeperLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const game = messages.games?.minesweeper_v1;
  const landing = game?.landing;
  const rules = game?.rules;
  const gameName = game?.name ?? 'Minesweeper';
  const description = game?.description ?? landing?.meta.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: MINESWEEPER_SLUG,
    slug: 'minesweeper',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: 1,
    maxPlayers: 1,
    genre: 'Puzzle',
    alternateName: ['Minesweeper Online', 'Free Minesweeper'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: {
      name: `How to Play Minesweeper on ${appConfig.appName}`,
      description: 'Play Minesweeper online free — no signup, no download.',
      steps: [
        {
          name: 'Choose difficulty',
          text: 'Select Beginner, Intermediate, or Expert to set grid size and mine count.',
        },
        {
          name: 'Click to reveal',
          text: 'Click any cell to reveal it. Numbers show adjacent mine counts.',
        },
        {
          name: 'Flag mines',
          text: 'Right-click to flag suspected mines. Reveal all safe cells to win.',
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
      <JsonLd id="json-ld-minesweeper" data={jsonLd} />
      <MinesweeperLanding
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        playHref={routes.minesweeperPlay}
        rules={rules}
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, ['Minesweeper', 'Puzzle', 'Сапёр'])}
      />
    </>
  );
}
