import { PageTitle, Typography } from '@arcadeum/ui';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { listAdminPackagesAction } from '@/features/admin-gem-packages/server/admin-gems.actions';
import { AdminGemPackagesTable } from '@/features/admin-gem-packages/ui/AdminGemPackagesTable';

export default async function AdminGemPackagesPage() {
  await requireAdmin();

  const packages = await listAdminPackagesAction();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          Gem Packages
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="medium">
          Manage purchasable gem packages shown to players.
        </Typography>
      </div>

      <AdminGemPackagesTable initialPackages={packages} />
    </div>
  );
}
