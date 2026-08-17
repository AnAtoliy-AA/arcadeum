import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import DevelopersClient from './DevelopersClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'developers' })
    : {};
}

export default async function DevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.developers;
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.developers?.title ?? 'Developers',
        url: routes.developers,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-developers-${locale}`} data={[breadcrumb]} />
      <DevelopersClient t={t} />
    </>
  );
}
