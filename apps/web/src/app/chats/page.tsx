import * as React from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { chatApi } from '@/features/chat/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { getTranslations } from '@/shared/i18n/server';
import ChatsClient from './ChatsClient';
import ChatsLoading from './loading';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chats',
  description: 'Manage your direct conversations and messages.',
};

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
    console.error('Failed to pre-fetch chats during SSR:', error);
  }

  return (
    <ChatsClient
      initialData={initialData}
      chatListT={messages.chatList}
      navigationT={messages.navigation}
    />
  );
}
