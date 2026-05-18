import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale } from '@/shared/i18n';
import SettingsClient from './SettingsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'settings' })
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
    <SettingsClient
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={description}
    />
  );
}
