import { Suspense } from 'react';
import HomeClient from './home/HomeClient';

export default function HomeRoute() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
