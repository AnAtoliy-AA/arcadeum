'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const LeaderboardsPageDynamic = dynamic(
  () => import('./LeaderboardsPageContent'),
  {
    // Server-rendered so crawlers and AI engines see the page H1/content.
    loading: () => <PageLoading layout="standard" />,
  },
);

const LeaderboardsClient = ({
  t,
  selfId,
  accessToken,
}: {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
}) => {
  return (
    <LeaderboardsPageDynamic t={t} selfId={selfId} accessToken={accessToken} />
  );
};

export default LeaderboardsClient;
