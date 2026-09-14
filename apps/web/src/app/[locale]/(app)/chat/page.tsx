import { Suspense } from 'react';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import dynamicImport from 'next/dynamic';
import { Typography } from '@arcadeum/ui';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'chat', noIndex: true }) : {};
}

const ChatPage = dynamicImport(() => import('./ChatPage'));

export default async function ChatRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PageBreadcrumb locale={locale} page="chat" />
      <Suspense
        fallback={
          <div className="flex flex-col p-7 items-center">
            <Typography uiSize="md" alpha="high">
              Loading...
            </Typography>
          </div>
        }
      >
        <ChatPage />
      </Suspense>
    </>
  );
}
