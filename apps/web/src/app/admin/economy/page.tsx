import { Suspense } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminEconomyTable } from '@/features/admin-economy/ui/AdminEconomyTable';
import { getTranslations } from '@/shared/i18n/server';
import { adminEconomyEn } from '@/shared/i18n/messages/pages/admin-economy/en';

interface AdminEconomyPageMessages {
  pages?: { adminEconomy?: { title?: string } };
}

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminEconomyPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminEconomyPageMessages;
  const title = messages.pages?.adminEconomy?.title ?? adminEconomyEn.title;

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
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Override runtime economy values. Changes take effect after the cache
          TTL (default 60 s) or after refreshing the cache.
        </p>
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
            Loading…
          </div>
        }
      >
        <AdminEconomyTable />
      </Suspense>
    </div>
  );
}
