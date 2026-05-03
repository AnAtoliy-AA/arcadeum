import { Suspense } from 'react';
import HomePage from './home/HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  alternates: {
    canonical: routes.home,
  },
};

export default function HomeRoute() {
  return (
    <Suspense fallback={<PageLoading layout="home" />}>
      <HomePage />
    </Suspense>
  );
}
