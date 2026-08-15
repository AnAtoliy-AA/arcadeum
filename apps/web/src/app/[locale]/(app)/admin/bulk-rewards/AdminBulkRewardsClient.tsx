'use client';

import dynamic from 'next/dynamic';
import { GlassCard } from '@arcadeum/ui';
import type { adminBulkRewardsEn } from '@/shared/i18n/messages/pages/admin-bulk-rewards/en';

type Labels = typeof adminBulkRewardsEn;

interface Props {
  labels: Labels;
}

const LoadingSkeleton = (
  <div className="box-border flex flex-col items-stretch gap-4 p-4">
    <span className="box-border">Loading...</span>
  </div>
);

const AdminBulkRewardsView = dynamic(
  () =>
    import('./AdminBulkRewardsView').then((mod) => mod.AdminBulkRewardsView),
  { ssr: false, loading: () => LoadingSkeleton },
);

export function AdminBulkRewardsClient({ labels }: Props) {
  return (
    <GlassCard className={'p-4'}>
      <AdminBulkRewardsView labels={labels} />
    </GlassCard>
  );
}
