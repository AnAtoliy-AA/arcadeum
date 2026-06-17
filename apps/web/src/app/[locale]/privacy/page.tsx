import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { appConfig } from '@/shared/config/app-config';
import PrivacyClient from './PrivacyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'privacy' }) : {};
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();

  return (
    <>
      <PageBreadcrumb locale={locale} page="privacy" />
      <PrivacyClient
        t={messages.legal?.privacy}
        contactT={messages.legal?.contact}
        PRIVACY_EMAIL={appConfig.privacyEmail}
      />
    </>
  );
}
