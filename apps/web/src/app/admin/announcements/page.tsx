import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminAnnouncementsClient from './AdminAnnouncementsClient';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  return <AdminAnnouncementsClient />;
}
