'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const CookiePolicyPageDynamic = dynamic(
  () => import('./CookiePolicyPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const CookiePolicyClient = (props: { t?: PageTranslations }) => {
  return <CookiePolicyPageDynamic {...props} />;
};

export default CookiePolicyClient;
