'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const PaymentPage = dynamic(
  () => import('./PaymentPage').then((mod) => mod.PaymentPage),
  {
    loading: () => <PageLoading />,
    ssr: false,
  },
);

export default function PaymentRoute() {
  return <PaymentPage />;
}
