import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import TermsClient from './TermsClient';

const LEGAL_NAME =
  process.env.NEXT_PUBLIC_LEGAL_NAME ??
  'Individual Entrepreneur Anatoliy Aliaksandrau';
const ID_CODE = process.env.NEXT_PUBLIC_ID_CODE ?? '';
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@arcadeum.app';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ??
  'Monday – Friday, 10:00 – 18:00 (GMT+4)';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'terms' })
    : {};
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
        LEGAL_NAME={LEGAL_NAME}
        ID_CODE={ID_CODE}
        SUPPORT_EMAIL={SUPPORT_EMAIL}
        WORKING_HOURS={WORKING_HOURS}
      />
    </>
  );
}
