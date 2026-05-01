'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const TournamentsPageDynamic = dynamic(
  () => import('./TournamentsPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const TournamentsClient = (props: { t?: PageTranslations }) => {
  return <TournamentsPageDynamic {...props} />;
};

export default TournamentsClient;
