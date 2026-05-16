import type {
  AnnouncementSeverity,
  AnnouncementAudience,
  AnnouncementLocale,
} from '../schemas/announcement.schema';

export type { AnnouncementSeverity, AnnouncementAudience, AnnouncementLocale };

export type AnnouncementStatus = 'active' | 'scheduled' | 'expired';

export interface AnnouncementLocaleContentItem {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export type AnnouncementContentMap = Partial<
  Record<AnnouncementLocale, AnnouncementLocaleContentItem>
> & {
  en: AnnouncementLocaleContentItem;
};

export interface AnnouncementAdminItem {
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

export interface AnnouncementsAdminListResponse {
  items: AnnouncementAdminItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AnnouncementPublicItem {
  id: string;
  severity: AnnouncementSeverity;
  updatedAt: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
