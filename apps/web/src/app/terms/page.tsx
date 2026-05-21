import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
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

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: `The terms and conditions for using ${appConfig.appName}: account rules, acceptable use, payments, and legal notices.`,
  path: routes.terms,
  keywords: ['terms of service', 'terms and conditions', 'legal', 'agreement'],
});

const TERMS_JSON_LD = [
  webPage({
    name: `Terms of Service — ${appConfig.appName}`,
    description: 'Terms and conditions for using the platform.',
    path: routes.terms,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Terms of Service', path: routes.terms },
  ]),
];

export default async function TermsPage() {
  const messages = await getTranslations();

  return (
    <>
      <JsonLd data={TERMS_JSON_LD} />
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
