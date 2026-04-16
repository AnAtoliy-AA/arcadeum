'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const DevelopersPageDynamic = dynamic(() => import('./DevelopersPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const DevelopersClient = (props: { t?: PageTranslations }) => {
  return <DevelopersPageDynamic {...props} />;
};

export default DevelopersClient;
