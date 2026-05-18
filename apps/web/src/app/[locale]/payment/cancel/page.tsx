import PaymentCancelClient from './PaymentCancelClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Cancelled',
  description: 'Your payment was cancelled.',
};

/**
 * Payment Cancel Page
 * Use PaymentCancelClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
