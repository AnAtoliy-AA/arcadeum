import { Suspense } from 'react';
import { HomeClient } from './HomeClient';

export const metadata = {
  title: 'Home | Welcome',
  description: 'Welcome to the home page of the app.',
};

export default function HomeRoute() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
