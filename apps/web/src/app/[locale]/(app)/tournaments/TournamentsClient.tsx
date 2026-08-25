'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const TournamentsPageDynamic = dynamic(
  () => import('./TournamentsPageContent'),
  {
    // Server-rendered so crawlers and AI engines see the page H1/content.
    loading: () => <PageLoading layout="standard" />,
  },
);

const TournamentsClient = () => {
  return <TournamentsPageDynamic />;
};

export default TournamentsClient;
