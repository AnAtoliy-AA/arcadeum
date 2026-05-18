import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import HelpClient from './HelpClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'help' }) : {};
}

/**
 * Help Page
 * Fetches translations on the server and passes them to HelpClient.
 * Use HelpClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();
  const t = messages.pages?.help;

  return (
    <>
      <PageBreadcrumb locale={locale} page="help" />
      <HelpClient t={t} />
    </>
  );
}
