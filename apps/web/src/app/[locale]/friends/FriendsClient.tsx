'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const FriendsPageDynamic = dynamic(
  () => import('./FriendsPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const FriendsClient = (props: {
  t?: PageTranslations;
  accessToken?: string;
}) => {
  return <FriendsPageDynamic {...props} />;
};

export default FriendsClient;
