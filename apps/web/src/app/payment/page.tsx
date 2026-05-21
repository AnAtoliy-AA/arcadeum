import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import PaymentClient from './PaymentClient';

export const metadata: Metadata = buildMetadata({
  title: 'Payment',
  description: 'Manage your payments and subscriptions.',
  path: routes.payment,
  index: false,
});

export default function PaymentRoute() {
  return <PaymentClient />;
}
