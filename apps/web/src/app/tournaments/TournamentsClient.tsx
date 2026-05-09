'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const TournamentsPageDynamic = dynamic(
  () => import('./TournamentsPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

const TournamentsClient = () => {
  return <TournamentsPageDynamic />;
};

export default TournamentsClient;
