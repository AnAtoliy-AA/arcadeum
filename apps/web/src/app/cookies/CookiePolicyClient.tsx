'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

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
