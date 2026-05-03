import { Suspense } from 'react';
import TestCrashContent from './TestCrashContent';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Test Crash',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: routes.testCrash,
  },
};

export default function TestCrashRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCrashContent />
    </Suspense>
  );
}
