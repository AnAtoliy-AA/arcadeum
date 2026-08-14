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
    <div
      style={{
        width: '100%',
        maxWidth: 800,
        minWidth: 0,
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color, #e4e4e7)',
            marginBottom: 4,
          }}
        >
          {labels.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--colorPress, #71717a)' }}>
          {labels.subtitle}
        </p>
      </div>

      <AdminBulkRewardsClient labels={labels} />
    </div>
  );
}
