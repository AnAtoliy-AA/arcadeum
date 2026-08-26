import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { JsonLd } from '@/shared/ui/JsonLd';
import TournamentsClient from './TournamentsClient';
import { fetchPublicTournaments } from '@/features/tournaments/api';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'tournaments' })
    : {};
}

/**
 * Tournaments Page (public). Translations are read on the client via
 * useLanguage to support the locale + nested list shape.
 */
export default async function TournamentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [messages, accessToken] = await Promise.all([
    getTranslations(locale),
    getServerAccessToken(),
  ]);
  const routes = buildRoutes(locale);

  let items: Array<{
    name: string;
    url: string;
    description?: string;
    itemType?: string;
  }> = [];
  let initialTournaments: Awaited<
    ReturnType<typeof fetchPublicTournaments>
  > | null = null;

  try {
    // Fetched once on the server: feeds both the JSON-LD below and the
    // client's first render, so the page never paints a loading spinner.
    initialTournaments = await fetchPublicTournaments({ locale, accessToken });
    items = (initialTournaments.items ?? []).map((t) => ({
      name: t.name,
      url: `${routes.tournaments}#${t.id}`,
      description: t.description || t.prizeDescription || undefined,
      itemType: 'SportsEvent',
    }));
  } catch {
    // Fail-safe fallbacks
  }

  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.tournaments,
    name: messages.seo?.tournaments?.title ?? 'Tournaments',
    description: messages.seo?.tournaments?.description,
    items,
  });
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.tournaments?.title ?? 'Tournaments',
        url: routes.tournaments,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-tournaments-${locale}`}
        data={[collectionPage, breadcrumb]}
      />
      <TournamentsClient initialTournaments={initialTournaments} />
    </>
  );
}
