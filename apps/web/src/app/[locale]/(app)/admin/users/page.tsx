import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminUsersClient from './AdminUsersClient';

// No `metadata` export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminUsersPage() {
  const user = await requireAdmin();
  return <AdminUsersClient currentUserId={user.id} />;
}
