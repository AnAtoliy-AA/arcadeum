import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AuthPageWrapper = dynamic(
  () =>
    import('@/features/auth/ui/AuthPageWrapper').then(
      (mod) => mod.AuthPageWrapper,
    ),
  {
    loading: () => null,
  },
);

export const metadata = {
  title: 'Sign In | Auth',
  description: 'Sign in to your account or register for a new one.',
};

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPageWrapper />
    </Suspense>
  );
}
