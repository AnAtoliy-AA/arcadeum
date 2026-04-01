'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

export const ReferralsClient = dynamic(
  () => import('./ReferralDashboard').then((mod) => mod.ReferralDashboard),
  {
    ssr: false,
    loading: () => <PageLoading />,
  },
);
