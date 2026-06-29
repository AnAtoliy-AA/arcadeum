'use client';

import dynamic from 'next/dynamic';
import { GlassCard, YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import type { adminBulkRewardsEn } from '@/shared/i18n/messages/pages/admin-bulk-rewards/en';

type Labels = typeof adminBulkRewardsEn;

interface Props {
  labels: Labels;
}

const LoadingSkeleton = (
  <YStack gap="$4" padding="$4">
    <Text>Loading...</Text>
  </YStack>
);

const AdminBulkRewardsView = dynamic(
  () =>
    import('./AdminBulkRewardsView').then((mod) => mod.AdminBulkRewardsView),
  { ssr: false, loading: () => LoadingSkeleton },
);

export function AdminBulkRewardsClient({ labels }: Props) {
  return (
    <GlassCard padding="$4">
      <AdminBulkRewardsView labels={labels} />
    </GlassCard>
  );
}
