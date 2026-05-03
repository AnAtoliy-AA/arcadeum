import { PaymentSuccessView } from './PaymentSuccessView';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Thank you for your purchase!',
  alternates: {
    canonical: routes.paymentSuccess,
  },
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
