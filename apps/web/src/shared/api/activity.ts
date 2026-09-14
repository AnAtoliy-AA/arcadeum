import { resolveApiUrl } from '@/shared/lib/api-base';

export interface ActivityFeedItem {
  id: string;
  type: string;
  userId: string;
  displayName: string;
  gameId: string;
  gameName: string;
  detail: string;
  timestamp: string;
}

export async function fetchActivityFeed(options?: {
  limit?: number;
  before?: string;
}): Promise<ActivityFeedItem[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.before) params.set('before', options.before);

  const url = resolveApiUrl(
    `/activity/feed${params.toString() ? `?${params.toString()}` : ''}`,
  );
  const res = await fetch(url, {
    next: { revalidate: 30 },
  });

  if (!res.ok) return [];
  return res.json();
}
