import { apiClient } from '@/shared/lib/api-client';

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
