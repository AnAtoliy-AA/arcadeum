'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { RewardsPageContentProps } from './RewardsPageContent';

const RewardsPageDynamic = dynamic(() => import('./RewardsPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const RewardsClient = (props: RewardsPageContentProps) => {
  return <RewardsPageDynamic {...props} />;
};

export default RewardsClient;
