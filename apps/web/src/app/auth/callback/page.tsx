import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import AuthCallbackClient from './AuthCallbackClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Auth Callback',
    description: 'Completing sign-in…',
    path: routes.authCallback,
    index: false,
    locale,
  });
}

export default function AuthCallbackRoute() {
  return <AuthCallbackClient />;
}
