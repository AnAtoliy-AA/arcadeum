'use client';

import { useEffect, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getPendingRequests } from '@/shared/api/friends';

export function usePendingFriendRequestCount(): number {
  const { snapshot } = useSessionTokens();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!snapshot.accessToken) return;
    let cancelled = false;
    getPendingRequests(snapshot.accessToken)
      .then((data) => {
        if (!cancelled) setCount(data.incoming.length);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);

  return count;
}
