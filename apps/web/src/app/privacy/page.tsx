import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getSeoMessages } from '@/shared/seo/messages';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import PrivacyClient from './PrivacyClient';

const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'arcadeum.care@gmail.com';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'privacy');
  return buildMetadata({
    ...seo,
    path: routes.privacy,
    keywords: ['privacy policy', 'data protection', 'gdpr', 'privacy'],
    locale,
  });
}

const PRIVACY_JSON_LD = [
  webPage({
    name: `Privacy Policy — ${appConfig.appName}`,
    description: 'Privacy practices and data handling.',
    path: routes.privacy,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Privacy Policy', path: routes.privacy },
  ]),
];

export default async function PrivacyPage() {
  const messages = await getTranslations();

  return (
    <>
      <JsonLd data={PRIVACY_JSON_LD} />
      <PrivacyClient
        t={messages.legal?.privacy}
        contactT={messages.legal?.contact}
        PRIVACY_EMAIL={PRIVACY_EMAIL}
      />
    </>
  );
}
