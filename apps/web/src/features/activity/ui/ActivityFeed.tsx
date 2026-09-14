'use client';

import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@arcadeum/ui';
import {
  fetchActivityFeed,
  type ActivityFeedItem,
} from '@/shared/api/activity';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedProps {
  initialItems?: ActivityFeedItem[];
}

export function ActivityFeed({ initialItems }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityFeedItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(!initialItems);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialItems) return;

    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchActivityFeed({ limit: 20 });
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialItems]);

  const loadMore = useCallback(async () => {
    if (loadingMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const lastItem = items[items.length - 1];
      const more = await fetchActivityFeed({
        limit: 20,
        before: lastItem.timestamp,
      });
      setItems((prev) => [...prev, ...more]);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [items, loadingMore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-4 text-center text-sm text-[var(--textSecondary)]">
        Failed to load activity
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--textSecondary)]">
        No recent activity
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}
      <button
        onClick={loadMore}
        disabled={loadingMore}
        className="mt-1 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold text-[var(--textSecondary)] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
      >
        {loadingMore ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
