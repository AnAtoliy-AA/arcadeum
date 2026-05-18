import { Suspense } from 'react';
import HomePage from './home/HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'home' }) : {};
}

export default function HomeRoute() {
  return (
    <Suspense fallback={<PageLoading layout="home" />}>
      <HomePage />
    </Suspense>
  );
}
