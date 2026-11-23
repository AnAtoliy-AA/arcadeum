'use client';

import { Skeleton } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

/** Loading placeholder that mirrors the hero, stats grid and list sections. */
export function ProfileSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      data-testid="profile-skeleton"
      role="status"
      aria-busy="true"
      aria-label={t('games.common.profile.loading')}
      className="flex flex-col items-stretch gap-5 p-4"
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)]">
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="flex flex-col gap-3 p-5">
          <div className="-mt-12 flex items-end gap-4">
            <Skeleton variant="circular" className="h-20 w-20" />
            <div className="flex flex-1 flex-col gap-2 pb-1">
              <Skeleton variant="text" className="h-5 w-40" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
