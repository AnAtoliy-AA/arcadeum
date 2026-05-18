import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import CookiePolicyClient from './CookiePolicyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'cookies' })
    : {};
}

/**
 * Cookie Policy Page
 * Fetches translations on the server and passes them to CookiePolicyClient.
 * Use CookiePolicyClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function CookiePolicyPage() {
  const messages = await getTranslations();
  const t = messages.pages?.cookies;

  return <CookiePolicyClient t={t} />;
}
