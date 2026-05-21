import { Suspense } from 'react';
import HomePage from './home/HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';

export const metadata: Metadata = buildMetadata({
  description: appConfig.seoDescription,
  path: routes.home,
  keywords: [
    'play board games',
    'multiplayer tabletop',
    'browser board games',
    'private game rooms',
    'tabletop with friends',
  ],
});

export default function HomeRoute() {
  return (
    <Suspense fallback={<PageLoading layout="home" />}>
      <HomePage />
    </Suspense>
  );
}
