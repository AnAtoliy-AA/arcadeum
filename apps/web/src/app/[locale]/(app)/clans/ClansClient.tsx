'use client';

import type { PageTranslations } from '@/shared/i18n/page-translations';
import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const ClansPageContent = dynamic(() => import('./ClansPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const ClansClient = ({
  t,
  accessToken,
}: {
  t?: PageTranslations;
  accessToken?: string;
}) => {
  return <ClansPageContent t={t} accessToken={accessToken} />;
};

export default ClansClient;
