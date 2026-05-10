import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { listAdminPackagesAction } from '@/features/admin-gem-packages/server/admin-gems.actions';
import { AdminGemPackagesTable } from '@/features/admin-gem-packages/ui/AdminGemPackagesTable';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminGemPackagesPage() {
  await requireAdmin();

  const packages = await listAdminPackagesAction();

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-text, #e4e4e7)',
            marginBottom: '4px',
          }}
        >
          Gem Packages
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Manage purchasable gem packages shown to players.
        </p>
      </div>

      <AdminGemPackagesTable initialPackages={packages} />
    </div>
  );
}
