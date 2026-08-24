import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import ClansClient from './ClansClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'clans' }) : {};
}

export default async function ClansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.clans;
  const accessToken = await getServerAccessToken();
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: t?.title ?? 'Clans',
        url: routes.clans,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-clans-${locale}`} data={[breadcrumb]} />
      <ClansClient t={t} accessToken={accessToken ?? undefined} />
    </>
  );
}
