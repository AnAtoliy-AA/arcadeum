import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import PaymentCancelClient from './PaymentCancelClient';

export const metadata: Metadata = buildMetadata({
  title: 'Payment Cancelled',
  description: 'Your payment was cancelled.',
  path: routes.paymentCancel,
  index: false,
});

export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
