import { Suspense } from 'react';
import { PaymentPage } from './PaymentPage';

export default function PaymentRoute() {
  return (
    <Suspense fallback={null}>
      <PaymentPage />
    </Suspense>
  );
}
