'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TestCrashContent() {
  const searchParams = useSearchParams();
  const shouldCrash = searchParams?.get('crash') === 'true';

  if (shouldCrash) {
    throw new Error('This is a test crash!');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Error Boundary Test Page</h1>
      <p>Add ?crash=true to URL to trigger a crash.</p>
    </div>
  );
}

export default function TestCrashPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestCrashContent />
    </Suspense>
  );
}
