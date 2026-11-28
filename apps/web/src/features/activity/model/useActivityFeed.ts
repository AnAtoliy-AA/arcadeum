'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchActivityFeed,
  type ActivityFeedFilter,
  type ActivityFeedItem,
} from '@/shared/api/activity';
import { mergeOlder, newItemsSince } from '../lib/groupActivity';

export const FEED_PAGE_SIZE = 12;
export const FEED_POLL_MS = 30_000;

export type FeedStatus = 'loading' | 'ready' | 'error';

interface FeedData {
  /** Request key this data belongs to; a mismatch means "loading". */
  key: string;
  items: ActivityFeedItem[];
  hasMore: boolean;
  error: boolean;
}

const EMPTY: FeedData = { key: '', items: [], hasMore: false, error: false };

/**
 * Feed state for one filter combination. New items found by polling are
 * held in `pending` and only shown when the viewer asks for them, so the
 * list never jumps under the reader.
 */
export function useActivityFeed(filter: ActivityFeedFilter, gameId: string) {
  const [reloadKey, setReloadKey] = useState(0);
  const key = `${filter}|${gameId}|${reloadKey}`;
  const [data, setData] = useState<FeedData>(EMPTY);
  const [pending, setPending] = useState<{
    key: string;
    items: ActivityFeedItem[];
  }>({
    key: '',
    items: [],
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsRef = useRef<ActivityFeedItem[]>([]);

  const status: FeedStatus =
    data.key !== key ? 'loading' : data.error ? 'error' : 'ready';
  const items = data.key === key ? data.items : EMPTY.items;
  const pendingItems = pending.key === key ? pending.items : EMPTY.items;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const query = {
      filter,
      gameId: gameId || undefined,
      limit: FEED_PAGE_SIZE,
    };
    fetchActivityFeed(query)
      .then((page) => {
        if (!cancelled) {
          setData({
            key,
            items: page.items,
            hasMore: page.hasMore,
            error: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setData({ ...EMPTY, key, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [filter, gameId, key]);

  // Poll for new activity while the tab is visible.
  useEffect(() => {
    if (status !== 'ready') return;
    let cancelled = false;
    const query = {
      filter,
      gameId: gameId || undefined,
      limit: FEED_PAGE_SIZE,
    };
    const poll = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const page = await fetchActivityFeed(query);
        if (cancelled) return;
        const fresh = newItemsSince(itemsRef.current, page.items);
        if (fresh.length > 0) setPending({ key, items: fresh });
      } catch {
        // Polling is best effort; the next tick retries.
      }
    };
    const timer = setInterval(() => void poll(), FEED_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [filter, gameId, key, status]);

  const showPending = useCallback(() => {
    setData((prev) => ({
      ...prev,
      items: [...pendingItems, ...newItemsSince(pendingItems, prev.items)],
    }));
    setPending({ key: '', items: [] });
  }, [pendingItems]);

  const loadMore = useCallback(async () => {
    const last = itemsRef.current[itemsRef.current.length - 1];
    if (!last || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchActivityFeed({
        filter,
        gameId: gameId || undefined,
        limit: FEED_PAGE_SIZE,
        before: last.timestamp,
      });
      setData((prev) =>
        prev.key === key
          ? {
              ...prev,
              items: mergeOlder(prev.items, page.items),
              hasMore: page.hasMore,
            }
          : prev,
      );
    } catch {
      // Keep the button so the viewer can try again.
    } finally {
      setLoadingMore(false);
    }
  }, [filter, gameId, key, loadingMore]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items,
    pending: pendingItems,
    status,
    hasMore: data.key === key && data.hasMore,
    loadingMore,
    showPending,
    loadMore,
    retry,
  };
}
