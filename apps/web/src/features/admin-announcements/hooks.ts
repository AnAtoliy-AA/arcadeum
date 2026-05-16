'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type AdminAnnouncementItem,
  type AdminAnnouncementsResponse,
  type ListAdminAnnouncementsArgs,
  type CreateAnnouncementBody,
  type UpdateAnnouncementBody,
} from './api';
import { ACTIVE_ANNOUNCEMENT_REFRESH_KEY } from '@/widgets/AnnouncementBanner/hooks/useActiveAnnouncement';

export const ADMIN_ANNOUNCEMENTS_REFRESH_KEY = 'admin-announcements';

function refreshKeys(triggerRefresh: (k: string) => void): void {
  triggerRefresh(ADMIN_ANNOUNCEMENTS_REFRESH_KEY);
  triggerRefresh(ACTIVE_ANNOUNCEMENT_REFRESH_KEY);
}

export function useAdminAnnouncements(args: ListAdminAnnouncementsArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminAnnouncementsResponse>({
    queryKey: [
      'admin-announcements',
      args.page ?? 1,
      args.pageSize ?? 25,
      args.q ?? '',
      args.status ?? 'all',
      args.severity ?? '',
    ],
    queryFn: () => fetchAdminAnnouncements(args, accessToken!),
    refreshKey: ADMIN_ANNOUNCEMENTS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useCreateAnnouncement() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminAnnouncementItem, CreateAnnouncementBody>({
    mutationFn: (body) => createAnnouncement(body, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}

export function useUpdateAnnouncement() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<
    AdminAnnouncementItem,
    { id: string; body: UpdateAnnouncementBody }
  >({
    mutationFn: ({ id, body }) => updateAnnouncement(id, body, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}

export function useDeleteAnnouncement() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<void, { id: string }>({
    mutationFn: ({ id }) => deleteAnnouncement(id, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}
