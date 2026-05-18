import { Suspense } from 'react';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import dynamic from 'next/dynamic';
import { YStack, Typography } from '@arcadeum/ui';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'chat' })
    : {};
}

const ChatPage = dynamic(() => import('./ChatPage'));

export default function ChatRoute() {
  return (
    <Suspense
      fallback={
        <YStack p="$7" ai="center">
          <Typography uiSize="md" alpha="medium">
            Loading...
          </Typography>
        </YStack>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
