import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import DevelopersClient from './DevelopersClient';

export const metadata: Metadata = buildMetadata({
  title: 'Developers',
  description: `API documentation, SDKs, and integration guides for building on the ${appConfig.appName} platform.`,
  path: routes.developers,
  keywords: [
    'arcadeum api',
    'game platform api',
    'board game sdk',
    'developer docs',
  ],
});

const DEVELOPERS_JSON_LD = [
  webPage({
    name: `Developers — ${appConfig.appName}`,
    description: `API documentation and developer resources for ${appConfig.appName}.`,
    path: routes.developers,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Developers', path: routes.developers },
  ]),
];

export default async function DevelopersPage() {
  const messages = await getTranslations();
  const t = messages.pages?.developers;

  return (
    <>
      <JsonLd data={DEVELOPERS_JSON_LD} />
      <DevelopersClient t={t} />
    </>
  );
}
