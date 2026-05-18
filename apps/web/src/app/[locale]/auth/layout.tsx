import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Auth',
  description: 'Sign in to your account or register for a new one.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
