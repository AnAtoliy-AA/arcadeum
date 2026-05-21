import { Suspense } from 'react';
import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import TestCrashContent from './TestCrashContent';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Test Crash',
    description: 'Internal test page.',
    path: routes.testCrash,
    index: false,
    locale,
  });
}

export default function TestCrashRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCrashContent />
    </Suspense>
  );
}
