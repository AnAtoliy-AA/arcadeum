import { PageTitle, Typography } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { getTranslations } from '@/shared/i18n/server';
import { adminXpBackfillEn } from '@/shared/i18n/messages/pages/admin-xp-backfill/en';
import { AdminXpBackfillClient } from './AdminXpBackfillClient';

interface AdminXpBackfillPageMessages {
  pages?: {
    adminXpBackfill?: Partial<typeof adminXpBackfillEn>;
  };
}

export default async function AdminXpBackfillPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminXpBackfillPageMessages;
  const t = messages.pages?.adminXpBackfill ?? {};
  const labels = { ...adminXpBackfillEn, ...t } as typeof adminXpBackfillEn;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          {labels.title}
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="high">
          {labels.subtitle}
        </Typography>
      </div>

      <AdminXpBackfillClient labels={labels} />
    </div>
  );
}
