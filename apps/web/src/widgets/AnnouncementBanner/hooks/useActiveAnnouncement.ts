'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { useLanguage } from '@/shared/i18n/context';
import { fetchActiveAnnouncement, type AnnouncementPublicItem } from '../api';
import { isDismissed } from '../lib/dismissedStorage';

export const ACTIVE_ANNOUNCEMENT_REFRESH_KEY = 'announcement-active';
const POLL_INTERVAL_MS = 60_000;

export function useActiveAnnouncement(): {
  data: AnnouncementPublicItem | null;
  refetch: () => void;
} {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const { locale } = useLanguage();

  const query = useQuery<AnnouncementPublicItem | null>({
    queryKey: ['announcement-active', locale, accessToken ?? null],
    queryFn: () => fetchActiveAnnouncement({ locale, accessToken }),
    refreshKey: ACTIVE_ANNOUNCEMENT_REFRESH_KEY,
  });

  const refetchRef = useRef(query.refetch);
  useEffect(() => {
    refetchRef.current = query.refetch;
  }, [query.refetch]);

  useEffect(() => {
    const handler = () => {
      void refetchRef.current();
    };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        void refetchRef.current();
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo<AnnouncementPublicItem | null>(() => {
    const a = query.data ?? null;
    if (!a) return null;
    if (a.severity === 'critical') return a;
    return isDismissed({ id: a.id, updatedAt: a.updatedAt }) ? null : a;
  }, [query.data]);

  return {
    data: filtered,
    refetch: () => void query.refetch(),
  };
}
