import { PaymentSuccessView } from './PaymentSuccessView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful',
  description: 'Thank you for your purchase!',
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
