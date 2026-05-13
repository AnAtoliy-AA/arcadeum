import { Suspense } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { AdminShopTable } from '@/features/admin-shop/ui/AdminShopTable';
import { getAdminCatalog } from '@/features/admin-shop/server/admin-shop.server';
import { getTranslations } from '@/shared/i18n/server';
import { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';

interface AdminShopPageMessages {
  pages?: {
    adminShop?: Partial<typeof adminShopEn>;
  };
}

// No metadata export — inherits noindex/nofollow from /admin/layout.tsx.

export default async function AdminShopPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminShopPageMessages;
  const t = messages.pages?.adminShop ?? {};
  const labels = { ...adminShopEn, ...t } as typeof adminShopEn;

  let catalog: EffectiveShopItem[] = [];
  try {
    catalog = await getAdminCatalog();
  } catch {
    // Render with empty catalog; the table component shows the empty state.
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        minWidth: 0,
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text, #e4e4e7)',
            marginBottom: 4,
          }}
        >
          {labels.title}
        </h1>
        <p style={{ fontSize: 14, color: '#71717a' }}>{labels.subtitle}</p>
      </div>

      <Suspense
        fallback={
          <div style={{ padding: '48px 16px', color: '#71717a' }}>
            {labels.loading}
          </div>
        }
      >
        <AdminShopTable catalog={catalog} labels={labels} />
      </Suspense>
    </div>
  );
}
