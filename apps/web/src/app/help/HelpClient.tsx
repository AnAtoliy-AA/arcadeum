'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const HelpPageDynamic = dynamic(() => import('./HelpPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const HelpClient = (props: { t?: PageTranslations }) => {
  return <HelpPageDynamic {...props} />;
};

export default HelpClient;
