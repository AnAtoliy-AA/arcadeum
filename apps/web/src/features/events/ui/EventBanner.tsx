'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { useEventsStore } from '../store/eventsStore';
import { buildRoutes, type Locale } from '@/shared/config/routes';

interface EventBannerTranslations {
  bannerTitle?: string;
  bannerSubtitle?: string;
  playNow?: string;
  joinEvent?: string;
  liveBadge?: string;
  upcomingBadge?: string;
}

export const EventBanner = ({
  locale = 'en',
  translations = {},
}: {
  locale?: string;
  translations?: EventBannerTranslations;
}) => {
  const { featuredEvent, fetchFeaturedEvent } = useEventsStore();
  const routes = buildRoutes(locale as Locale);

  useEffect(() => {
    fetchFeaturedEvent();
  }, [fetchFeaturedEvent]);

  if (!featuredEvent) return null;

  const detailUrl = routes.eventDetail
    ? routes.eventDetail(featuredEvent.id)
    : `/${locale}/events/${featuredEvent.id}`;

  const isLive = featuredEvent.status === 'active';

  return (
    <div
      data-testid="event-banner"
      className="relative overflow-hidden rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/15 via-[var(--glassBg)] to-[var(--accent)]/10 p-4 md:p-6 backdrop-blur-md shadow-lg shadow-[var(--primary)]/5 mb-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                {translations.liveBadge ?? 'LIVE NOW'}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40">
                {translations.upcomingBadge ?? 'UPCOMING'}
              </span>
            )}
            <span className="text-xs font-semibold uppercase text-[var(--textMuted)]">
              {featuredEvent.gameType}
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-extrabold text-[var(--text)] tracking-tight">
            {featuredEvent.title}
          </h2>
          <p className="text-sm text-[var(--textMuted)] line-clamp-1">
            {featuredEvent.description ||
              translations.bannerSubtitle ||
              'Join the scheduled community showdown right now.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href={detailUrl} className="w-full md:w-auto">
            <Button
              variant="primary"
              className="w-full md:w-auto justify-center px-6 py-2.5 text-sm font-semibold shadow-md shadow-[var(--primary)]/20"
            >
              {isLive
                ? (translations.playNow ?? 'Play Now')
                : (translations.joinEvent ?? 'View Event')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
