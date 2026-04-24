'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const ReferralDashboard = dynamic(() => import('./ReferralDashboard'), {
  ssr: false,
  loading: () => <PageLoading />,
});

function ReferralsClient() {
  return <ReferralDashboard />;
}

export default ReferralsClient;
