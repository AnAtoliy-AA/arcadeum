import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Sign In | Auth',
  description: 'Sign in to your account or register for a new one.',
  alternates: {
    canonical: routes.auth,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
