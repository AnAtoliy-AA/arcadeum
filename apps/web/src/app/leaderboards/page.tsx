import { getTranslations } from '@/shared/i18n/server';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import type { Metadata } from 'next';
import LeaderboardsClient from './LeaderboardsClient';

export const metadata: Metadata = {
  title: 'Leaderboards',
  description: 'See the top players and rankings.',
  alternates: {
    canonical: '/leaderboards',
  },
};

export default async function LeaderboardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;
  // TODO(ARC-588-be): resolve user id from session on the BE; for now we send
  // a per-user opaque token so the mock can render a stable self row.
  const accessToken = await getServerAccessToken();
  const selfId = accessToken ? accessToken.slice(0, 16) : undefined;

  return <LeaderboardsClient t={t} selfId={selfId} />;
}
