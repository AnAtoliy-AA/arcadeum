import AuthCallbackClient from './AuthCallbackClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth Callback',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackRoute() {
  return <AuthCallbackClient />;
}
