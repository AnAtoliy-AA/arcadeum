import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import CookiePolicyClient from './CookiePolicyClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Cookie Policy',
    description: `How ${appConfig.appName} uses cookies and similar technologies to keep you signed in, remember preferences, and improve the experience.`,
    path: routes.cookies,
    keywords: ['cookie policy', 'cookies', 'privacy', 'tracking'],
    locale,
  });
}

const COOKIES_JSON_LD = [
  webPage({
    name: `Cookie Policy — ${appConfig.appName}`,
    description: 'How we use cookies.',
    path: routes.cookies,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Cookie Policy', path: routes.cookies },
  ]),
];

export default async function CookiePolicyPage() {
  const messages = await getTranslations();
  const t = messages.pages?.cookies;

  return (
    <>
      <JsonLd data={COOKIES_JSON_LD} />
      <CookiePolicyClient t={t} />
    </>
  );
}
