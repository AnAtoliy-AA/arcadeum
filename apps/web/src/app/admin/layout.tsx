import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <AdminLayoutClient username={user.username}>{children}</AdminLayoutClient>
  );
}
