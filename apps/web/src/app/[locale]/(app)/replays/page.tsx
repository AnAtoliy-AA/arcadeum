import { Suspense } from 'react';
import ReplaysClient from './ReplaysClient';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Game Replays · Arcadeum',
    description: 'Browse and watch game replays step by step.',
  };
}

export default async function ReplaysPage() {
  return (
    <Suspense fallback={<ReplaysLoadingSkeleton />}>
      <ReplaysClient />
    </Suspense>
  );
}

function ReplaysLoadingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[rgba(255,255,255,0.06)]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]"
          />
        ))}
      </div>
    </div>
  );
}
