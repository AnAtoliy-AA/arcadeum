import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import AuthCallbackClient from './AuthCallbackClient';

export const metadata: Metadata = buildMetadata({
  title: 'Auth Callback',
  description: 'Completing sign-in…',
  path: routes.authCallback,
  index: false,
});

export default function AuthCallbackRoute() {
  return <AuthCallbackClient />;
}
