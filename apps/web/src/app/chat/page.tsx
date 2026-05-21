import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { YStack, Typography } from '@arcadeum/ui';
import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Chat',
    description: 'Chat with other players.',
    path: routes.chat,
    index: false,
    locale,
  });
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
