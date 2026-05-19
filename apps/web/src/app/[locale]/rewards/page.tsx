import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import RewardsClient from './RewardsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'rewards' }) : {};
}

/**
 * Rewards Page
 * Fetches translations on the server and passes them to RewardsClient.
 * Use RewardsClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function RewardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();
  const t = messages.pages?.rewards;

  return (
    <>
      <PageBreadcrumb locale={locale} page="rewards" />
      <RewardsClient t={t} />
    </>
  );
}
