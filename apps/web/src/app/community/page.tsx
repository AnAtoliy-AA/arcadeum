import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import CommunityClient from './CommunityClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Community',
    description: `Join the ${appConfig.appName} community — find groups, threads, and tournaments, and connect with other players.`,
    path: routes.community,
    keywords: [
      'board game community',
      'find players',
      'discord tabletop',
      'community games',
    ],
    locale,
  });
}

const COMMUNITY_JSON_LD = [
  webPage({
    name: `Community — ${appConfig.appName}`,
    description:
      'Meet players, join groups, and discover community tournaments.',
    path: routes.community,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Community', path: routes.community },
  ]),
];

export default async function CommunityPage() {
  const messages = await getTranslations();
  const t = messages.pages?.community;

  return (
    <>
      <JsonLd data={COMMUNITY_JSON_LD} />
      <CommunityClient t={t} />
    </>
  );
}
