'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const CommunityPageDynamic = dynamic(() => import('./CommunityPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const CommunityClient = (props: { t?: PageTranslations }) => {
  return <CommunityPageDynamic {...props} />;
};

export default CommunityClient;
