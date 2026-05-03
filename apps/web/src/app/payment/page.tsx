import PaymentClient from './PaymentClient';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Payment',
  description: 'Manage your payments and subscriptions.',
  alternates: {
    canonical: routes.payment,
  },
};

export default function PaymentRoute() {
  return <PaymentClient />;
}
