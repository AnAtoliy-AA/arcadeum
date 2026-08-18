'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

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
