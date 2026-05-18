'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

const PaymentPage = dynamic(() => import('./PaymentPage'), {
  loading: () => <PageLoading />,
  ssr: false,
});

export default function PaymentClient() {
  return <PaymentPage />;
}
