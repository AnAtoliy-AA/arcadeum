'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { useEventsStore } from '../store/eventsStore';
import { EventPrizeBadge } from './EventPrizeBadge';
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
  const featuredEvent = useEventsStore((s) => s.featuredEvent);
  const fetchFeaturedEvent = useEventsStore((s) => s.fetchFeaturedEvent);
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
    <div className="w-full max-w-[1400px] mx-auto px-4 my-6">
      <div
        data-testid="event-banner"
        className="relative overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-5 md:p-6 backdrop-blur-md shadow-lg shadow-[var(--primary)]/5 transition-all duration-300 hover:border-[var(--primary)]/40"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--errorBgSoft)] text-[var(--danger)] border border-[var(--errorBorder)] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                  {translations.liveBadge ?? 'LIVE NOW'}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/15 text-[var(--accent)] border border-[var(--primary)]/30">
                  {translations.upcomingBadge ?? 'UPCOMING'}
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-2.5 py-0.5 rounded-md bg-[var(--glassBorder)]/40 border border-[var(--glassBorder)]">
                {featuredEvent.gameType}
              </span>
              {featuredEvent.prizeBadge && (
                <EventPrizeBadge
                  badgeId={featuredEvent.prizeBadge}
                  variant="chip"
                />
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black text-color tracking-tight m-0">
              {featuredEvent.title}
            </h2>
            <p className="text-sm md:text-base text-[var(--textSecondary)] line-clamp-2 m-0 opacity-90 leading-relaxed">
              {featuredEvent.description ||
                translations.bannerSubtitle ||
                'Join the scheduled community showdown right now.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <Link href={detailUrl} className="w-full md:w-auto">
              <Button
                variant="primary"
                className="w-full md:w-auto justify-center px-6 py-2.5 text-sm font-bold shadow-md shadow-[var(--primary)]/20"
              >
                {isLive
                  ? (translations.playNow ?? 'Play Now')
                  : (translations.joinEvent ?? 'View Event')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
