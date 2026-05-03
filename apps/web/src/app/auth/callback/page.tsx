import AuthCallbackClient from './AuthCallbackClient';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Auth Callback',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: routes.authCallback,
  },
};

export default function AuthCallbackRoute() {
  return <AuthCallbackClient />;
}
