import { Suspense } from 'react';
import HomePage from './HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';

export const metadata = {
  title: 'Home | Welcome',
  description: 'Welcome to the home page of the app.',
};

export default function HomeRoute() {
  return (
    <Suspense fallback={<PageLoading layout="home" />}>
      <HomePage />
    </Suspense>
  );
}
