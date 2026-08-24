import { PageTitle, Typography } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { getTranslations } from '@/shared/i18n/server';
import { adminBulkRewardsEn } from '@/shared/i18n/messages/pages/admin-bulk-rewards/en';
import { AdminBulkRewardsClient } from './AdminBulkRewardsClient';

interface AdminBulkRewardsPageMessages {
  pages?: {
    adminBulkRewards?: Partial<typeof adminBulkRewardsEn>;
  };
}

export default async function AdminBulkRewardsPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminBulkRewardsPageMessages;
  const t = messages.pages?.adminBulkRewards ?? {};
  const labels = { ...adminBulkRewardsEn, ...t } as typeof adminBulkRewardsEn;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          {labels.title}
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="medium">
          {labels.subtitle}
        </Typography>
      </div>

      <AdminBulkRewardsClient labels={labels} />
    </div>
  );
}
