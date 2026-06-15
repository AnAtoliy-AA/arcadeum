import { Suspense } from 'react';
import HomePage from './home/HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoObjectJsonLd } from '@/shared/seo/videoObjectJsonLd';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'home' }) : {};
}

export default async function HomeRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : 'en';
  const videoId = appConfig.presentationVideoId;
  let videoJsonLd: Record<string, unknown> | null = null;
  if (videoId) {
    const messages = await getTranslations(safeLocale);
    const seoHome = messages.seo?.home;
    videoJsonLd = buildVideoObjectJsonLd({
      locale: safeLocale,
      youtubeId: videoId,
      name: seoHome?.title ?? `${appConfig.appName} — Platform overview`,
      description: seoHome?.description ?? appConfig.seoDescription,
      uploadDate: '2025-01-01',
    });
  }

  const messages = await getTranslations(safeLocale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    locale: safeLocale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [],
  });

  return (
    <>
      {videoJsonLd ? <JsonLd data={videoJsonLd} /> : null}
      <JsonLd id="json-ld-home-breadcrumb" data={breadcrumbJsonLd} />
      <Suspense fallback={<PageLoading layout="home" />}>
        <HomePage />
      </Suspense>
    </>
  );
}
