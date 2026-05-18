import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'auth' }) : {};
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
