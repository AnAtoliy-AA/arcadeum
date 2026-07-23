import { Suspense } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminGameRulesTable } from '@/features/admin-games/ui/AdminGameRulesTable';

export default async function AdminGameRulesPage() {
  await requireAdmin();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        minWidth: 0,
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-text, #e4e4e7)',
            marginBottom: '4px',
          }}
        >
          Game Rules Visibility
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Include or exclude house rules per game. Excluded rules show
          &quot;Coming Soon&quot; in the lobby.
        </p>
      </div>

      <Suspense
        fallback={
          <div
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: '#71717a',
            }}
          >
            Loading...
          </div>
        }
      >
        <AdminGameRulesTable />
      </Suspense>
    </div>
  );
}
