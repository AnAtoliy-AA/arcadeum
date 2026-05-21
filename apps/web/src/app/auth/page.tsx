import { Suspense } from 'react';
import type { Metadata } from 'next';

import AuthPageWrapper from '@/features/auth/ui/AuthPageWrapper';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Sign in',
    description: 'Sign in to your account.',
    path: routes.auth,
    index: false,
    locale,
  });
}

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
