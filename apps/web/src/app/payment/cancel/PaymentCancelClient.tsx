'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const PaymentCancelClient = dynamic(
  () => import('./PaymentCancelPageContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

export default PaymentCancelClient;
