import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { getFeaturesData } from './features-parser';
import FeaturesClient from './FeaturesClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'features' })
    : {};
}

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.features;
  const routes = buildRoutes(locale);
  const sections = await getFeaturesData();

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.features?.title ?? 'Features',
        url: routes.features,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-features-${locale}`} data={[breadcrumb]} />
      <FeaturesClient sections={sections} t={t ?? null} />
    </>
  );
}
