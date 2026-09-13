'use client';

import dynamic from 'next/dynamic';
import { GlassCard } from '@arcadeum/ui';
import type { adminXpBackfillEn } from '@/shared/i18n/messages/pages/admin-xp-backfill/en';

type Labels = typeof adminXpBackfillEn;

interface Props {
  labels: Labels;
}

const LoadingSkeleton = (
  <div className="flex flex-col items-stretch gap-4 p-4">
    <span className="">Loading...</span>
  </div>
);

const AdminXpBackfillView = dynamic(
  () => import('./AdminXpBackfillView').then((mod) => mod.AdminXpBackfillView),
  { ssr: false, loading: () => LoadingSkeleton },
);

export function AdminXpBackfillClient({ labels }: Props) {
  return (
    <GlassCard className={'p-4'}>
      <AdminXpBackfillView labels={labels} />
    </GlassCard>
  );
}
