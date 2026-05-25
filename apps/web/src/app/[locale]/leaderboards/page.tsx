import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import LeaderboardsClient from './LeaderboardsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'leaderboards' })
    : {};
}

export default async function LeaderboardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.leaderboards;
  const accessToken = await getServerAccessToken();
  // Mock fallback (NEXT_PUBLIC_E2E / NEXT_PUBLIC_USE_LEADERBOARD_MOCK) keys
  // its synthetic self row off this opaque id; the real BE resolves the user
  // from the access token via JwtOptionalAuthGuard.
  const selfId = accessToken ? accessToken.slice(0, 16) : undefined;
  const routes = buildRoutes(locale);

  // Leaderboard data is fetched client-side and changes constantly, so
  // emit an empty ItemList shell — Google still picks up CollectionPage
  // signal and renders the breadcrumb.
  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.leaderboards,
    name: messages.seo?.leaderboards?.title ?? 'Leaderboards',
    description: messages.seo?.leaderboards?.description,
    items: [],
  });
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.leaderboards?.title ?? 'Leaderboards',
        url: routes.leaderboards,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-leaderboards-${locale}`}
        data={[collectionPage, breadcrumb]}
      />
      <LeaderboardsClient
        t={t}
        selfId={selfId}
        accessToken={accessToken ?? undefined}
      />
    </>
  );
}
