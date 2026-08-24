import { Suspense } from 'react';
import { PageTitle, Typography, Spinner } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminGameRulesTable } from '@/features/admin-games/ui/AdminGameRulesTable';

export default async function AdminGameRulesPage() {
  await requireAdmin();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          Game Rules Visibility
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="medium">
          Include or exclude house rules per game. Excluded rules show
          &quot;Coming Soon&quot; in the lobby.
        </Typography>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-[var(--colorTextSecondary,#a1a1aa)]">
            <Spinner size="md" />
            <Typography variant="body" uiSize="sm">
              Loading...
            </Typography>
          </div>
        }
      >
        <AdminGameRulesTable />
      </Suspense>
    </div>
  );
}
