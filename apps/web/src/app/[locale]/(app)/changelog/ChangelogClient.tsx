'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { ChangelogEntry } from './page';

const ChangelogViewDynamic = dynamic(() => import('./ChangelogView'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

export default function ChangelogClient({
  entries,
}: {
  entries: ChangelogEntry[];
}) {
  return <ChangelogViewDynamic entries={entries} />;
}
