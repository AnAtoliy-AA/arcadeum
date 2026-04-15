import * as React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { chatApi } from '@/features/chat/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { ChatListPage } from './ChatListPage';
import ChatsLoading from './loading';

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
      return <ChatListPage initialData={null} />;
    }
    console.error('Failed to pre-fetch chats during SSR:', error);
  }

  // Handle unauthorized outside try/catch to avoid NEXT_REDIRECT console noise
  if (!accessToken) {
    // If accessToken is missing and we want to redirect, we could do it here
    // but the ApiError inside the try/catch usually handles the 401.
  }

  // Check if we need to redirect after the catch
  // (Note: If we threw the error above, we won't even reach here,
  // and Next.js will catch the thrown redirect internally if we call redirect() here)

  // Let's use a simpler pattern like in history

  return <ChatListPage initialData={initialData} />;
}
