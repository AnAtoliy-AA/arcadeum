import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildProfilePageJsonLd } from '@/shared/seo/profilePageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import PlayerProfileClient from './PlayerProfileClient';

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
    page: 'playerProfile',
    // /<locale>/players/<id> — same shape across locales.
    pathFor: (r) => `${r.home}/players/${encodeURIComponent(id)}`,
  });
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.leaderboards;
  const routes = buildRoutes(locale);

  // Player display name is fetched client-side; emit a generic Person
  // placeholder so the ProfilePage signal is still present in initial
  // HTML for crawlers. The client may hydrate richer data after mount.
  const profileLabel = messages.seo?.playerProfile?.title ?? 'Player profile';
  const profile = buildProfilePageJsonLd({
    locale,
    playerId: id,
    displayName: profileLabel,
    description: messages.seo?.playerProfile?.description,
  });
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.leaderboards?.title ?? 'Leaderboards',
        url: routes.leaderboards,
      },
      {
        name: profileLabel,
        url: `${routes.home}/players/${encodeURIComponent(id)}`,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-player-${id}-${locale}`}
        data={[profile, breadcrumb]}
      />
      <PlayerProfileClient id={id} t={t} />
    </>
  );
}
