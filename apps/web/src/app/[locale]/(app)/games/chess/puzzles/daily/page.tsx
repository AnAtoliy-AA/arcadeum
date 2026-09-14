import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { JsonLd } from '@/shared/ui/JsonLd';
import { DailyChessPuzzleClient } from './DailyChessPuzzleClient';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  return buildPageMetadata({ locale, page: 'dailyChessPuzzle' });
}

export default async function DailyChessPuzzlePage({ params }: PageProps) {
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
        name: 'Daily Puzzle',
        url: `${appConfig.siteUrl}${routes.chessDailyPuzzle}`,
      },
    ],
  });

  const dailyPuzzleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: messages.seo?.dailyChessPuzzle?.title ?? 'Daily Chess Puzzle',
    description:
      messages.seo?.dailyChessPuzzle?.description ??
      'Daily tactical chess puzzle challenge with streak tracking.',
    url: `${appConfig.siteUrl}${routes.chessDailyPuzzle}`,
    inLanguage: locale,
    educationalUse: 'Practice',
    about: {
      '@type': 'Thing',
      name: 'Chess Tactics',
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={dailyPuzzleSchema} />
      <DailyChessPuzzleClient locale={locale} />
    </>
  );
}
