import type { Metadata } from 'next';

import { getTranslations } from '@/shared/i18n/server';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, profilePage } from '@/shared/seo/jsonLd';
import PlayerProfileClient from './PlayerProfileClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  return buildMetadata({
    title: `Player ${id}`,
    description: `Player rank, stats, and recent matches on ${appConfig.appName}.`,
    path: `/players/${id}`,
    ogType: 'profile',
    locale,
  });
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;

  const jsonLd = [
    profilePage({
      id,
      name: `Player ${id}`,
      description: `Player profile and stats on ${appConfig.appName}.`,
    }),
    breadcrumbList([
      { name: 'Home', path: routes.home },
      { name: 'Leaderboards', path: routes.leaderboards },
      { name: `Player ${id}`, path: `/players/${id}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PlayerProfileClient id={id} t={t} />
    </>
  );
}
