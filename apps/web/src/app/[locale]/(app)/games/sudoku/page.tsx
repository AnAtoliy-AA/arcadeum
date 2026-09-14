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
import SudokuLanding from './SudokuLanding';

export const dynamic = 'force-static';

export const revalidate = 300;

const SUDOKU_SLUG = 'sudoku_v1';

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
  return buildPageMetadata({ locale, page: 'sudokuLanding' });
}

export default async function SudokuLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const game = messages.games?.sudoku_v1;
  const landing = game?.landing;
  const rules = game?.rules;
  const gameName = game?.name ?? 'Sudoku';
  const description = game?.description ?? landing?.meta.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: SUDOKU_SLUG,
    slug: 'sudoku',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: 1,
    maxPlayers: 1,
    genre: 'Puzzle',
    alternateName: ['Sudoku Online', 'Free Sudoku'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: {
      name: `How to Play Sudoku on ${appConfig.appName}`,
      description: 'Play Sudoku online free — no signup, no download.',
      steps: [
        {
          name: 'Choose difficulty',
          text: 'Pick Easy, Medium, Hard, or Expert.',
        },
        {
          name: 'Fill the grid',
          text: 'Enter digits 1–9 so each row, column, and 3×3 box contains every digit once.',
        },
        {
          name: 'Complete the puzzle',
          text: 'Fill all 81 cells correctly to win.',
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
      <JsonLd id="json-ld-sudoku" data={jsonLd} />
      <SudokuLanding
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        playHref={routes.sudokuPlay}
        rules={rules}
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, ['Sudoku', 'Puzzle'])}
      />
    </>
  );
}
