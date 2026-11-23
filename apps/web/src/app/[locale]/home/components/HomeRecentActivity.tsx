'use client';

import { ActivityFeed } from '@/features/activity/ui/ActivityFeed';
import { useTranslation } from '@/shared/i18n/useTranslation';

export function HomeRecentActivity() {
  const { t } = useTranslation();
  return (
    <section
      data-testid="home-recent-activity"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-8"
    >
      <h2 className="text-[24px] font-bold text-color">
        {t('home.homeRecentActivityTitle')}
      </h2>
      <ActivityFeed />
    </section>
  );
}
