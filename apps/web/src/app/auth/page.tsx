import { Suspense } from 'react';
import { AuthPageWrapper } from '@/features/auth/ui/AuthPageWrapper';

// metadata moved to layout.tsx

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
