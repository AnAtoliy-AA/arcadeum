import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import TournamentsClient from './TournamentsClient';

export const metadata: Metadata = buildMetadata({
  title: 'Tournaments',
  description: `Join competitive board game tournaments on ${appConfig.appName} — compete for rewards, climb the bracket, and play with friends.`,
  path: routes.tournaments,
  keywords: [
    'board game tournaments',
    'online tournaments',
    'compete board games',
    'ranked play',
  ],
});

const TOURNAMENTS_JSON_LD = [
  webPage({
    name: `Tournaments — ${appConfig.appName}`,
    description: 'Competitive board game tournaments and rewards.',
    path: routes.tournaments,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Tournaments', path: routes.tournaments },
  ]),
];

export default async function TournamentsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.tournaments;

  return (
    <>
      <JsonLd data={TOURNAMENTS_JSON_LD} />
      <TournamentsClient t={t} />
    </>
  );
}
