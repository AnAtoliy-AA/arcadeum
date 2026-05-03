import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import LeaderboardsClient from './LeaderboardsClient';

export const metadata: Metadata = {
  title: 'Leaderboards',
  description: 'See the top players and rankings.',
  alternates: {
    canonical: '/leaderboards',
  },
};

/**
 * Leaderboards Page
 * Fetches translations on the server and passes them to LeaderboardsClient.
 * Use LeaderboardsClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function LeaderboardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;

  return <LeaderboardsClient t={t} />;
}
