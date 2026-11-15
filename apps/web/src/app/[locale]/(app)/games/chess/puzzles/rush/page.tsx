import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PuzzleRush } from '@/widgets/BoardGames/ChessPuzzles/ui/PuzzleRush';
import { ChessPuzzleTabs } from '@/widgets/BoardGames/ChessPuzzles/ui/ChessPuzzleTabs';

export const revalidate = 300;

interface ChessPuzzleRushPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ChessPuzzleRushPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  return {
    title: messages.games?.chess_v1?.puzzleRush?.title
      ? `${messages.games.chess_v1.puzzleRush.title} | Arcadeum`
      : 'Puzzle Rush | Arcadeum',
    description:
      messages.games?.chess_v1?.puzzleRush?.subtitle ??
      'Solve as many chess puzzles as you can before time runs out or you lose 3 lives.',
  };
}

export default async function ChessPuzzleRushPage({
  params,
}: ChessPuzzleRushPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const breadcrumbs = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.seo?.home?.title ?? 'Home',
    trail: [
      {
        name: messages.games?.chess_v1?.name ?? 'Chess',
        url: `${appConfig.siteUrl}${routes.chessLanding}`,
      },
      {
        name: 'Puzzles',
        url: `${appConfig.siteUrl}${routes.chessPuzzles}`,
      },
      {
        name: 'Puzzle Rush',
        url: `${appConfig.siteUrl}${routes.chessPuzzleRush}`,
      },
    ],
  });

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <JsonLd data={breadcrumbs} />
      <div className="w-full max-w-[900px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-4 text-center">
          Puzzle Rush
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Solve as many puzzles as you can before time runs out or you lose 3
          lives
        </p>
        <ChessPuzzleTabs activeTab="rush" locale={locale} />
        <PuzzleRush />
      </div>
    </main>
  );
}
