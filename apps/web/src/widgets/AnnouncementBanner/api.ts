import { apiClient } from '@/shared/lib/api-client';

/**
 * Refresh-store key for the announcement query. Kept for the admin
 * announcement hooks; the public banner is server-rendered and no longer
 * subscribes (see server/getActiveAnnouncement).
 */
export const ACTIVE_ANNOUNCEMENT_REFRESH_KEY = 'announcement-active';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';

export interface AnnouncementPublicItem {
  id: string;
  severity: AnnouncementSeverity;
  updatedAt: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FetchActiveOptions {
  locale?: string;
  accessToken?: string | null;
}

export function buildActiveAnnouncementUrl(opts: FetchActiveOptions): string {
  const qs = new URLSearchParams();
  if (opts.locale) qs.set('locale', opts.locale);
  const s = qs.toString();
  return s ? `/announcements/active?${s}` : '/announcements/active';
}

export async function fetchActiveAnnouncement(
  opts: FetchActiveOptions,
): Promise<AnnouncementPublicItem | null> {
  const url = buildActiveAnnouncementUrl(opts);
  const res = await apiClient.get<{
    announcement: AnnouncementPublicItem | null;
  }>(url, opts.accessToken ? { token: opts.accessToken } : undefined);
  return res.announcement;
}
