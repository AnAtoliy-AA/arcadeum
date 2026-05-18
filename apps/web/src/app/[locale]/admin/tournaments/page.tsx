import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminTournamentsClient from './AdminTournamentsClient';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminTournamentsPage() {
  await requireAdmin();
  return <AdminTournamentsClient />;
}
