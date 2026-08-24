import { Suspense } from 'react';
import { isLocale } from '@/shared/i18n';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { replayApi } from '@/features/replay/api';
import ReplayClient from './ReplayClient';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; replayId: string }>;
}): Promise<Metadata> {
  const { locale, replayId } = await params;
  if (!isLocale(locale)) return {};

  try {
    const replay = await replayApi.getReplay(replayId, {
      timeout: SSR_TIMEOUT,
    });
    const playerNames = replay.players.map((p) => p.displayName).join(' vs ');
    return {
      title: `${replay.gameId} Replay — ${playerNames}`,
      description: `Watch ${replay.gameId} replay: ${playerNames} (${replay.totalMoves} moves)`,
    };
  } catch {
    return {
      title: 'Game Replay',
      description: 'Watch a game replay step by step',
    };
  }
}

interface PageProps {
  params: Promise<{ locale: string; replayId: string }>;
}

export default async function ReplayPage({ params }: PageProps) {
  const { replayId } = await params;

  return (
    <Suspense fallback={<ReplayLoadingSkeleton />}>
      <ReplayDataFetcher replayId={replayId} />
    </Suspense>
  );
}

async function ReplayDataFetcher({ replayId }: { replayId: string }) {
  let replay = null;
  try {
    replay = await replayApi.getReplay(replayId, { timeout: SSR_TIMEOUT });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to fetch replay during SSR:', error);
    }
  }

  return <ReplayClient initialReplay={replay} replayId={replayId} />;
}

function ReplayLoadingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[rgba(255,255,255,0.06)]" />
      <div className="h-64 w-full animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]" />
      <div className="h-12 w-full animate-pulse rounded-lg bg-[rgba(255,255,255,0.04)]" />
    </div>
  );
}
