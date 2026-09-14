import AuthCallbackClient from './AuthCallbackClient';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

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
