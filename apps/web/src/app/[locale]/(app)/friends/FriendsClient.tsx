'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const FriendsPageDynamic = dynamic(() => import('./FriendsPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const FriendsClient = ({
  t,
  accessToken,
}: {
  t?: PageTranslations;
  accessToken?: string;
}) => {
  return <FriendsPageDynamic t={t} accessToken={accessToken} />;
};

export default FriendsClient;
