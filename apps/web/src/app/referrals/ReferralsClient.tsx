'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const ReferralDashboard = dynamic(
  () => import('./ReferralDashboard').then((mod) => mod.ReferralDashboard),
  {
    ssr: false,
    loading: () => <PageLoading />,
  },
);

export function ReferralsClient() {
  return <ReferralDashboard />;
}
