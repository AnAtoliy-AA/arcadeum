import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { appConfig } from '@/shared/config/app-config';
import ContactView from './ContactView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'contact' }) : {};
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();
  const t = messages.legal?.contact;

  return (
    <>
      <PageBreadcrumb locale={locale} page="contact" />
      <ContactView
        t={t}
        SUPPORT_EMAIL={appConfig.supportEmail}
        WORKING_HOURS={appConfig.workingHours}
      />
    </>
  );
}
