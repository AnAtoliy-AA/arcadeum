import * as React from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { chatApi } from '@/features/chat/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { getTranslations } from '@/shared/i18n/server';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import ChatsClient from './ChatsClient';
import ChatsLoading from './loading';
import { routes } from '@/shared/config/routes';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Chats',
  description: 'Manage your direct conversations and messages.',
  path: routes.chats,
  index: false,
});

export default function ChatsRoute() {
  return (
    <React.Suspense fallback={<ChatsLoading />}>
      <ChatDataFetcher />
    </React.Suspense>
  );
}

async function ChatDataFetcher() {
  const accessToken = await getServerAccessToken();
  const messages = await getTranslations();

  // Initial fetch on server
  let initialData = null;
  try {
    if (accessToken) {
      initialData = await chatApi.getChats({
        token: accessToken,
        timeout: SSR_TIMEOUT,
      });
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === HttpStatus.UNAUTHORIZED) {
      // Intentionally ignore to show 'Login Required' UI on the client
      return (
        <ChatsClient
          initialData={null}
          chatListT={messages.chatList}
          navigationT={messages.navigation}
        />
      );
    }
    handleSsrFetchError('chats', error);
  }

  return (
    <ChatsClient
      initialData={initialData}
      chatListT={messages.chatList}
      navigationT={messages.navigation}
    />
  );
}
