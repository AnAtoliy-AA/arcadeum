'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';

const PaymentPage = dynamic(() => import('./PaymentPage'), {
  loading: () => <PageLoading />,
  ssr: false,
});

export default function PaymentClient() {
  return <PaymentPage />;
}
