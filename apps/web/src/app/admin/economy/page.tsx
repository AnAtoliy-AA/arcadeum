import { Suspense } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminEconomyTable } from '@/features/admin-economy/ui/AdminEconomyTable';
import { getTranslations } from '@/shared/i18n/server';
import { adminEconomyEn } from '@/shared/i18n/messages/pages/admin-economy/en';

interface AdminEconomyPageMessages {
  pages?: {
    adminEconomy?: { title?: string; subtitle?: string; loading?: string };
  };
}

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminEconomyPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminEconomyPageMessages;
  const t = messages.pages?.adminEconomy ?? {};
  const title = t.title ?? adminEconomyEn.title;
  const subtitle = t.subtitle ?? adminEconomyEn.subtitle;
  const loading = t.loading ?? adminEconomyEn.loading;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
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
            data-testid="economy-table-loading"
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
        <AdminEconomyTable />
      </Suspense>
    </div>
  );
}
