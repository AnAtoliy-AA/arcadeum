import { Suspense } from 'react';
import { PageTitle, Typography, Spinner } from '@arcadeum/ui';
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

export default async function AdminShopPage() {
  await requireAdmin();

  const messages = (await getTranslations()) as AdminShopPageMessages;
  const t = messages.pages?.adminShop ?? {};
  const labels = { ...adminShopEn, ...t } as typeof adminShopEn;

  let catalog: EffectiveShopItem[] = [];
  try {
    catalog = await getAdminCatalog();
  } catch {
    catalog = [];
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle size="lg" gradient>
          {labels.title}
        </PageTitle>
        <Typography variant="body" uiSize="md" alpha="medium">
          {labels.subtitle}
        </Typography>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-[var(--colorTextSecondary,#a1a1aa)]">
            <Spinner size="md" />
            <Typography variant="body" uiSize="sm">
              {labels.loading}
            </Typography>
          </div>
        }
      >
        <AdminShopTable catalog={catalog} labels={labels} />
      </Suspense>
    </div>
  );
}
