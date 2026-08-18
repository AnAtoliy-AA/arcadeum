import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { appConfig } from '@/shared/config/app-config';
import TermsClient from './TermsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'terms' }) : {};
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();

  return (
    <>
      <PageBreadcrumb locale={locale} page="terms" />
      <TermsClient
        t={messages.legal?.terms}
        contactT={messages.legal?.contact}
        LEGAL_NAME={appConfig.legalName}
        ID_CODE={appConfig.idCode}
        SUPPORT_EMAIL={appConfig.supportEmail}
        WORKING_HOURS={appConfig.workingHours}
      />
    </>
  );
}
