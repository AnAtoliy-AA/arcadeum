import { Suspense } from 'react';
import type { Metadata } from 'next';

import AuthPageWrapper from '@/features/auth/ui/AuthPageWrapper';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to your account.',
  path: routes.auth,
  index: false,
});

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
