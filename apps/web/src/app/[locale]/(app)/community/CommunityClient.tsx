'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const CommunityPageDynamic = dynamic(() => import('./CommunityPageContent'), {
  // Server-rendered so crawlers and AI engines see the page H1/content.
  loading: () => <PageLoading layout="standard" />,
});

const CommunityClient = (props: { t?: PageTranslations }) => {
  return <CommunityPageDynamic {...props} />;
};

export default CommunityClient;
