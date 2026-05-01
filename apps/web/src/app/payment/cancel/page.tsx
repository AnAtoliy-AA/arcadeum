import PaymentCancelClient from './PaymentCancelClient';

/**
 * Payment Cancel Page
 * Use PaymentCancelClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
