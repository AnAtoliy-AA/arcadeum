import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { PaymentSuccessView } from './PaymentSuccessView';

export const metadata: Metadata = buildMetadata({
  title: 'Payment Successful',
  description: 'Thank you for your purchase!',
  path: routes.paymentSuccess,
  index: false,
});

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
