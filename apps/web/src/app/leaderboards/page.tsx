import { getTranslations } from '@/shared/i18n/server';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import LeaderboardsClient from './LeaderboardsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Leaderboards',
    description: `See the top-ranked players on ${appConfig.appName} — global, weekly, and per-game leaderboards updated in real time.`,
    path: routes.leaderboards,
    keywords: [
      'board game rankings',
      'player leaderboard',
      'top players',
      'ranked board games',
    ],
    locale,
  });
}

const LEADERBOARDS_JSON_LD = [
  webPage({
    name: `Leaderboards — ${appConfig.appName}`,
    description: 'Top-ranked players and global standings.',
    path: routes.leaderboards,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Leaderboards', path: routes.leaderboards },
  ]),
];

export default async function LeaderboardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;
  const accessToken = await getServerAccessToken();
  // Mock fallback (NEXT_PUBLIC_E2E / NEXT_PUBLIC_USE_LEADERBOARD_MOCK) keys
  // its synthetic self row off this opaque id; the real BE resolves the user
  // from the access token via JwtOptionalAuthGuard.
  const selfId = accessToken ? accessToken.slice(0, 16) : undefined;

  return (
    <>
      <JsonLd data={LEADERBOARDS_JSON_LD} />
      <LeaderboardsClient
        t={t}
        selfId={selfId}
        accessToken={accessToken ?? undefined}
      />
    </>
  );
}
