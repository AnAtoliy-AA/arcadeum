import { Suspense } from 'react';
import AuthPageWrapper from '@/features/auth/ui/AuthPageWrapper';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

// metadata moved to layout.tsx

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
