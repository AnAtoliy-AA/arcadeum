import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import EventsClient from './EventsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'events' }) : {};
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.events;
  const accessToken = await getServerAccessToken();
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: t?.title ?? 'Events',
        url: routes.events,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-events-${locale}`} data={[breadcrumb]} />
      <EventsClient
        t={t}
        locale={locale}
        accessToken={accessToken ?? undefined}
      />
    </>
  );
}
