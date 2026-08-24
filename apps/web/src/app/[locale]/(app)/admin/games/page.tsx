import { Suspense } from 'react';
import { PageTitle, Typography, Spinner } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminGamesTable } from '@/features/admin-games/ui/AdminGamesTable';
import { getTranslations } from '@/shared/i18n/server';
import { adminGamesEn } from '@/shared/i18n/messages/pages/admin-games/en';

interface AdminGamesPageMessages {
  pages?: {
    adminGames?: { title?: string; subtitle?: string; loading?: string };
  };
}

export default async function AdminGamesPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminGamesPageMessages;
  const t = messages.pages?.adminGames ?? {};
  const title = t.title ?? adminGamesEn.title;
  const subtitle = t.subtitle ?? adminGamesEn.subtitle;
  const loading = t.loading ?? adminGamesEn.loading;

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
            data-testid="admin-games-table-loading"
            className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-[var(--colorTextSecondary,#a1a1aa)]"
          >
            <Spinner size="md" />
            <Typography variant="body" uiSize="sm">
              {loading}
            </Typography>
          </div>
        }
      >
        <AdminGamesTable />
      </Suspense>
    </div>
  );
}
