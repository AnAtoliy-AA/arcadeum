import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
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

/**
 * Developers Page
 * Fetches translations on the server and passes them to DevelopersClient.
 * Use DevelopersClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function DevelopersPage() {
  const messages = await getTranslations();
  const t = messages.pages?.developers;

  return <DevelopersClient t={t} />;
}
