import { Suspense } from 'react';
import HomePage from './home/HomePage';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getSeoMessages } from '@/shared/seo/messages';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { JsonLd } from '@/shared/ui/JsonLd';
import { youTubeVideoObject } from '@/shared/seo/jsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'home');
  return buildMetadata({
    ...seo,
    path: routes.home,
    keywords: [
      'play board games',
      'multiplayer tabletop',
      'browser board games',
      'private game rooms',
      'tabletop with friends',
    ],
    locale,
  });
}

export default function HomeRoute() {
  const videoJsonLd = appConfig.presentationVideoId
    ? youTubeVideoObject({
        name: `${appConfig.appName} — Platform overview`,
        description: appConfig.seoDescription,
        youtubeId: appConfig.presentationVideoId,
      })
    : null;

  return (
    <>
      {videoJsonLd ? <JsonLd data={videoJsonLd} /> : null}
      <Suspense fallback={<PageLoading layout="home" />}>
        <HomePage />
      </Suspense>
    </>
  );
}
