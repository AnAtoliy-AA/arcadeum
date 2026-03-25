'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AuthPageWrapper = dynamic(
  () =>
    import('@/features/auth/ui/AuthPageWrapper').then(
      (mod) => mod.AuthPageWrapper,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
