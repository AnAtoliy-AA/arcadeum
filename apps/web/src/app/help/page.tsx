import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import HelpClient from './HelpClient';

export const metadata: Metadata = buildMetadata({
  title: 'Help Center',
  description: `Answers to common questions, troubleshooting steps, and platform guides for ${appConfig.appName}.`,
  path: routes.help,
  keywords: [
    'arcadeum help',
    'board game faq',
    'support center',
    'how to play',
  ],
});

const HELP_JSON_LD = [
  webPage({
    name: `Help Center — ${appConfig.appName}`,
    description: 'Answers to common questions and platform guides.',
    path: routes.help,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Help', path: routes.help },
  ]),
];

export default async function HelpPage() {
  const messages = await getTranslations();
  const t = messages.pages?.help;

  return (
    <>
      <JsonLd data={HELP_JSON_LD} />
      <HelpClient t={t} />
    </>
  );
}
