'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const LeaderboardsPageDynamic = dynamic(
  () => import('./LeaderboardsPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const LeaderboardsClient = (props: {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
}) => {
  return <LeaderboardsPageDynamic {...props} />;
};

export default LeaderboardsClient;
