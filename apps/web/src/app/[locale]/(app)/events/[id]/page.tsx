import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import EventDetailClient from './EventDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const validLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const routes = buildRoutes(validLocale);
  return buildPageMetadata({
    locale: validLocale,
    page: 'events',
    pathFor: () => routes.eventDetail(id),
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
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
      {
        name: id,
        url: routes.eventDetail(id),
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-event-detail-${id}-${locale}`} data={[breadcrumb]} />
      <EventDetailClient
        id={id}
        t={t}
        locale={locale}
        accessToken={accessToken ?? undefined}
      />
    </>
  );
}
