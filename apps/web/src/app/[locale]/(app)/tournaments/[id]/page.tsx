import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { JsonLd } from '@/shared/ui/JsonLd';
import TournamentDetailClient from './TournamentDetailClient';
import { fetchTournamentBracket } from '@/features/tournaments/api';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  return buildPageMetadata({
    locale,
    page: 'tournaments',
    pathFor: (r) => `${r.tournaments}/${encodeURIComponent(id)}`,
  });
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [messages, initialBracket] = await Promise.all([
    getTranslations(locale),
    // Fail-safe: the client hook refetches on mount regardless.
    fetchTournamentBracket(id).catch(() => null),
  ]);
  const routes = buildRoutes(locale);
  const t = messages.pages?.tournaments;

  const detailUrl = `${routes.tournaments}/${encodeURIComponent(id)}`;
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.tournaments?.title ?? 'Tournaments',
        url: routes.tournaments,
      },
      {
        name: t?.bracket?.title ?? 'Bracket',
        url: detailUrl,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-tournament-${id}-${locale}`} data={breadcrumb} />
      <TournamentDetailClient id={id} initialBracket={initialBracket} />
    </>
  );
}
