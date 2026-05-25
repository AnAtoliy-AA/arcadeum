import { Suspense } from 'react';
import ResetPasswordClient from '@/features/auth/ui/ResetPasswordClient';

export default function ResetRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
