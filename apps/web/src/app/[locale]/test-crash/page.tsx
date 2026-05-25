import { Suspense } from 'react';
import TestCrashContent from './TestCrashContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Crash',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestCrashRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCrashContent />
    </Suspense>
  );
}
