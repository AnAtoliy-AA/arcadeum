import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { JsonLd } from '@/shared/ui/JsonLd';
import { ChessPuzzlesClient } from './ChessPuzzlesClient';

export const dynamic = 'force-static';
export const revalidate = 300;

interface ChessPuzzlesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ChessPuzzlesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const chessName = messages.games?.chess_v1?.name ?? 'Chess';
  return {
    title: `${chessName} Training & Tactical Puzzles | Arcadeum`,
    description:
      'Improve your chess tactical vision with rated puzzles, rush mode, 1v1 duels, and mistake reviews.',
  };
}

export default async function ChessPuzzlesPage({
  params,
}: ChessPuzzlesPageProps) {
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
    ],
  });

  const puzzlesSchema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Chess Tactical Puzzles',
    description:
      'Improve your chess tactical vision with rated puzzles, rush mode, 1v1 duels, and mistake reviews.',
    url: `${appConfig.siteUrl}${routes.chessPuzzles}`,
    inLanguage: locale,
    educationalLevel: 'Beginner to Grandmaster',
    learningResourceType: 'Practice Problem',
  };

  return (
    <>
      <link
        rel="preload"
        href="/images/chess/arcadeum_chess_sprite.svg"
        as="image"
        type="image/svg+xml"
        fetchPriority="high"
      />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={puzzlesSchema} />
      <main className="flex flex-col items-center min-h-screen py-6">
        <div className="w-full max-w-[900px] px-4">
          <h1 className="text-2xl font-bold text-[var(--color)] mb-4 text-center">
            Chess Training
          </h1>
          <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
            Improve your chess with daily puzzles, rush mode, 1v1 duels, and
            mistake reviews
          </p>
          <ChessPuzzlesClient locale={locale} />
        </div>
      </main>
    </>
  );
}
