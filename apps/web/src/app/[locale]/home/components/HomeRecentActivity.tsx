'use client';

import { ActivityFeed } from '@/features/activity/ui/ActivityFeed';
import { useTranslation } from '@/shared/i18n/useTranslation';

export function HomeRecentActivity() {
  const { t } = useTranslation();
  return (
    <section
      data-testid="home-recent-activity"
      aria-labelledby="home-recent-activity-title"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-8"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="home-recent-activity-title"
          className="m-0 flex items-center gap-2 text-[24px] font-bold text-color"
        >
          {t('home.homeRecentActivityTitle')}
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-[var(--success)] motion-safe:animate-pulse"
          />
        </h2>
        <p className="m-0 text-[14px] text-[var(--textSecondary)]">
          {t('home.activityFeed.subtitle')}
        </p>
      </header>
      <ActivityFeed />
    </section>
  );
}
