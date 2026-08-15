import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import AdminLayoutShell from './AdminLayoutShell';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildPageMetadata({ locale, page: 'admin', noIndex: true });
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <AdminLayoutShell username={user.username}>{children}</AdminLayoutShell>
  );
}
