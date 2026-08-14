import { Suspense } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminGamesTable } from '@/features/admin-games/ui/AdminGamesTable';
import { getTranslations } from '@/shared/i18n/server';
import { adminGamesEn } from '@/shared/i18n/messages/pages/admin-games/en';

interface AdminGamesPageMessages {
  pages?: {
    adminGames?: { title?: string; subtitle?: string; loading?: string };
  };
}

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminGamesPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminGamesPageMessages;
  const t = messages.pages?.adminGames ?? {};
  const title = t.title ?? adminGamesEn.title;
  const subtitle = t.subtitle ?? adminGamesEn.subtitle;
  const loading = t.loading ?? adminGamesEn.loading;

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
          {title}
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a' }}>{subtitle}</p>
      </div>

      <Suspense
        fallback={
          <div
            data-testid="admin-games-table-loading"
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: '#71717a',
            }}
          >
            {loading}
          </div>
        }
      >
        <AdminGamesTable />
      </Suspense>
    </div>
  );
}
