import { requireAdmin } from '@/entities/session/api/requireAdmin';
import BlockedIpsClient from './BlockedIpsClient';

export default async function AdminBlockedIpsPage() {
  await requireAdmin();
  return <BlockedIpsClient />;
}
