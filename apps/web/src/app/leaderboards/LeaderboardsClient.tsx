'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const LeaderboardsPageDynamic = dynamic(
  () => import('./LeaderboardsPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const LeaderboardsClient = (props: { t?: PageTranslations }) => {
  return <LeaderboardsPageDynamic {...props} />;
};

export default LeaderboardsClient;
