import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import FriendsClient from './FriendsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'friends' })
    : {};
}

export default async function FriendsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.friends;
  const accessToken = await getServerAccessToken();
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: t?.title ?? 'Friends',
        url: routes.friends,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-friends-${locale}`} data={[breadcrumb]} />
      <FriendsClient
        t={t}
        accessToken={accessToken ?? undefined}
      />
    </>
  );
}
