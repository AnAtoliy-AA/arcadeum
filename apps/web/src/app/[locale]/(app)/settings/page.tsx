import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale } from '@/shared/i18n';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'settings', noIndex: true })
    : {};
}

export default async function SettingsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const description =
    messages.seo?.settings?.description ??
    `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`;

  return (
    <>
      <PageBreadcrumb locale={locale} page="settings" />
      <SettingsClient
        appName={appConfig.appName}
        downloads={appConfig.downloads}
        supportCta={appConfig.supportCta}
        description={description}
      />
    </>
  );
}
