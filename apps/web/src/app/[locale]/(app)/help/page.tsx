import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import HelpClient from './HelpClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'help' }) : {};
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.help;
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.help?.title ?? 'Help Center',
        url: routes.help,
      },
    ],
  });

  const jsonLdData = [breadcrumb];

  return (
    <>
      <JsonLd id={`json-ld-help-${locale}`} data={jsonLdData} />
      <HelpClient t={t} />
    </>
  );
}
