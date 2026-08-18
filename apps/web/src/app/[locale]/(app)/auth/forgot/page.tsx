import { Suspense } from 'react';
import ForgotPasswordClient from '@/features/auth/ui/ForgotPasswordClient';

export default function ForgotRoute() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
