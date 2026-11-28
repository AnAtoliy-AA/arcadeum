'use client';

import { useMemo, useRef, useState } from 'react';
import { Button, EmptyState, ErrorState, LinkButton } from '@arcadeum/ui';
import type { ActivityFeedFilter } from '@/shared/api/activity';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useActivityFeed } from '../model/useActivityFeed';
import { groupActivity } from '../lib/groupActivity';
import { ActivityCard } from './ActivityCard';
import { ActivityGroupCard } from './ActivityGroupCard';
import { ActivityFeedFilters } from './ActivityFeedFilters';
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton';

export function ActivityFeed() {
  const { t } = useTranslation();
  const routes = useRoutes();
  const [filter, setFilter] = useState<ActivityFeedFilter>('all');
  const [gameId, setGameId] = useState('');
  const feed = useActivityFeed(filter, gameId);
  const listRef = useRef<HTMLUListElement>(null);
  const entries = useMemo(() => groupActivity(feed.items), [feed.items]);
  const isFiltered = filter !== 'all' || gameId !== '';

  const revealPending = () => {
    feed.showPending();
    const list = listRef.current;
    if (!list) return;
    list.focus({ preventScroll: true });
    if (typeof list.scrollIntoView === 'function') {
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      list.scrollIntoView({
        block: 'nearest',
        behavior: reduce ? 'auto' : 'smooth',
      });
    }
  };

  let body: React.ReactNode;
  if (feed.status === 'loading') {
    body = <ActivityFeedSkeleton />;
  } else if (feed.status === 'error') {
    body = (
      <ErrorState
        message={t('home.homeRecentActivityError')}
        onRetry={feed.retry}
        retryLabel={t('home.activityFeed.retry')}
      />
    );
  } else if (entries.length === 0) {
    body = (
      <EmptyState
        message={
          isFiltered
            ? t('home.activityFeed.emptyFiltered')
            : t('home.homeRecentActivityEmpty')
        }
        action={
          <LinkButton href={routes.games} variant="primary" size="sm">
            {t('home.activityFeed.emptyCta')}
          </LinkButton>
        }
      />
    );
  } else {
    body = (
      <>
        <ul
          ref={listRef}
          tabIndex={-1}
          aria-label={t('home.activityFeed.listLabel')}
          data-testid="activity-feed-list"
          className="m-0 grid grid-cols-1 gap-2.5 p-0 outline-none lg:grid-cols-2"
        >
          {entries.map((entry) =>
            entry.kind === 'group' ? (
              <ActivityGroupCard key={entry.key} items={entry.items} />
            ) : (
              <ActivityCard key={entry.key} item={entry.item} />
            ),
          )}
        </ul>
        {feed.hasMore && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              loading={feed.loadingMore}
              onClick={() => void feed.loadMore()}
              data-testid="activity-feed-more"
            >
              {feed.loadingMore
                ? t('home.homeRecentActivityLoading')
                : t('home.activityFeed.showMore')}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4" aria-busy={feed.status === 'loading'}>
      <ActivityFeedFilters
        filter={filter}
        gameId={gameId}
        onFilterChange={setFilter}
        onGameChange={setGameId}
      />
      <div aria-live="polite" className="flex justify-center empty:hidden">
        {feed.pending.length > 0 && (
          <button
            type="button"
            onClick={revealPending}
            data-testid="activity-feed-new"
            className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--primary)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--primary)_14%,transparent)] px-4 text-[13px] font-semibold text-[var(--color)] shadow-sm transition-colors hover:bg-[color:color-mix(in_srgb,var(--primary)_22%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-[var(--success)] motion-safe:animate-pulse"
            />
            {t('home.activityFeed.newActivity', { count: feed.pending.length })}
          </button>
        )}
      </div>
      {body}
    </div>
  );
}
