import { Suspense } from 'react';
import { PageTitle, Typography, Spinner } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminEconomyTable } from '@/features/admin-economy/ui/AdminEconomyTable';
import { getTranslations } from '@/shared/i18n/server';
import { adminEconomyEn } from '@/shared/i18n/messages/pages/admin-economy/en';

interface AdminEconomyPageMessages {
  pages?: {
    adminEconomy?: { title?: string; subtitle?: string; loading?: string };
  };
}

export default async function AdminEconomyPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminEconomyPageMessages;
  const t = messages.pages?.adminEconomy ?? {};
  const title = t.title ?? adminEconomyEn.title;
  const subtitle = t.subtitle ?? adminEconomyEn.subtitle;
  const loading = t.loading ?? adminEconomyEn.loading;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          {title}
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="medium">
          {subtitle}
        </Typography>
      </div>

      <Suspense
        fallback={
          <div
            data-testid="economy-table-loading"
            className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-[var(--colorTextSecondary,#a1a1aa)]"
          >
            <Spinner size="md" />
            <Typography variant="body" uiSize="sm">
              {loading}
            </Typography>
          </div>
        }
      >
        <AdminEconomyTable />
      </Suspense>
    </div>
  );
}
