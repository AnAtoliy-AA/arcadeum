import PaymentClient from './PaymentClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment',
  description: 'Manage your payments and subscriptions.',
};

export default function PaymentRoute() {
  return <PaymentClient />;
}
