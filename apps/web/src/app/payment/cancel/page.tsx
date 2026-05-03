import PaymentCancelClient from './PaymentCancelClient';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Payment Cancelled',
  description: 'Your payment was cancelled.',
  alternates: {
    canonical: routes.paymentCancel,
  },
};

/**
 * Payment Cancel Page
 * Use PaymentCancelClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
