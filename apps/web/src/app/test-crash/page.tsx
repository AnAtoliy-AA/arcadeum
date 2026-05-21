import { Suspense } from 'react';
import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import TestCrashContent from './TestCrashContent';

export const metadata: Metadata = buildMetadata({
  title: 'Test Crash',
  description: 'Internal test page.',
  path: routes.testCrash,
  index: false,
});

export default function TestCrashRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCrashContent />
    </Suspense>
  );
}
