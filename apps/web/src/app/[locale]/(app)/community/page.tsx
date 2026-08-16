import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale, type Locale } from '@/shared/i18n';
import { appConfig } from '@/shared/config/app-config';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'community' })
    : {};
}

/**
 * Community Page
 * Fetches translations on the server and passes them to CommunityClient.
 * Emits Organization structured data JSON-LD with official social profile URLs.
 */
export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? (rawLocale as Locale) : 'en';
  const messages = await getTranslations();
  const t = messages.pages?.community;

  const sameAsUrls = Object.values(appConfig.social).filter(
    (url): url is string => Boolean(url) && url.startsWith('http'),
  );

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appConfig.appName,
    url: appConfig.siteUrl,
    logo: `${appConfig.siteUrl}/icon.png`,
    description: appConfig.seoDescription,
    email: appConfig.supportEmail,
    sameAs: sameAsUrls,
  };

  return (
    <>
      <JsonLd id={`json-ld-community-${locale}`} data={organizationJsonLd} />
      <PageBreadcrumb locale={locale} page="community" />
      <CommunityClient t={t} />
    </>
  );
}
