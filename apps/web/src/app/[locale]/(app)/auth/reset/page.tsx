import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import ResetPasswordClient from '@/features/auth/ui/ResetPasswordClient';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'authReset' })
    : {};
}

export default function ResetRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
