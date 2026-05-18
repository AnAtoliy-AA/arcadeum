import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
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
 * Use CommunityClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();
  const t = messages.pages?.community;

  return (
    <>
      <PageBreadcrumb locale={locale} page="community" />
      <CommunityClient t={t} />
    </>
  );
}
