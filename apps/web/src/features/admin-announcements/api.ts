import { apiClient } from '@/shared/lib/api-client';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';
export type AnnouncementAudience = 'all' | 'authenticated' | 'anonymous';
export type AnnouncementStatus = 'active' | 'scheduled' | 'expired';
export type AnnouncementLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';
export type AdminAnnouncementsStatusFilter = 'all' | AnnouncementStatus;

export const ANNOUNCEMENT_SEVERITIES: readonly AnnouncementSeverity[] = [
  'info',
  'warning',
  'critical',
] as const;
export const ANNOUNCEMENT_AUDIENCES: readonly AnnouncementAudience[] = [
  'all',
  'authenticated',
  'anonymous',
] as const;
export const ANNOUNCEMENT_LOCALES: readonly AnnouncementLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

export interface LocaleContent {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export type AnnouncementContentMap = Partial<
  Record<AnnouncementLocale, LocaleContent>
> & {
  en: LocaleContent;
};

export interface AdminAnnouncementItem {
  id: string;
  severity: AnnouncementSeverity;
  audience: AnnouncementAudience;
  startsAt: string | null;
  endsAt: string | null;
  content: AnnouncementContentMap;
  createdBy: { id: string; displayName: string | null } | null;
  createdAt: string;
  updatedAt: string;
  status: AnnouncementStatus;
}

export interface AdminAnnouncementsResponse {
  items: AdminAnnouncementItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminAnnouncementsArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminAnnouncementsStatusFilter;
  severity?: AnnouncementSeverity | null;
}

export interface CreateAnnouncementBody {
  severity: AnnouncementSeverity;
  audience?: AnnouncementAudience;
  startsAt?: string | null;
  endsAt?: string | null;
  content: AnnouncementContentMap;
}

export type UpdateAnnouncementBody = Partial<CreateAnnouncementBody>;

export function buildAdminAnnouncementsUrl(
  args: ListAdminAnnouncementsArgs,
): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q && args.q.trim()) qs.set('q', args.q);
  if (args.status && args.status !== 'all') qs.set('status', args.status);
  if (args.severity) qs.set('severity', args.severity);
  const s = qs.toString();
  return s ? `/admin/announcements?${s}` : '/admin/announcements';
}

export async function fetchAdminAnnouncements(
  args: ListAdminAnnouncementsArgs,
  accessToken: string,
): Promise<AdminAnnouncementsResponse> {
  return apiClient.get<AdminAnnouncementsResponse>(
    buildAdminAnnouncementsUrl(args),
    { token: accessToken },
  );
}

export async function createAnnouncement(
  body: CreateAnnouncementBody,
  accessToken: string,
): Promise<AdminAnnouncementItem> {
  return apiClient.post<AdminAnnouncementItem>('/admin/announcements', body, {
    token: accessToken,
  });
}

export async function updateAnnouncement(
  id: string,
  body: UpdateAnnouncementBody,
  accessToken: string,
): Promise<AdminAnnouncementItem> {
  return apiClient.patch<AdminAnnouncementItem>(
    `/admin/announcements/${encodeURIComponent(id)}`,
    body,
    { token: accessToken },
  );
}

export async function deleteAnnouncement(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete<void>(
    `/admin/announcements/${encodeURIComponent(id)}`,
    { token: accessToken },
  );
}
