import * as React from 'react';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { chatApi } from '@/features/chat/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { getTranslations } from '@/shared/i18n/server';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import ChatsClient from './ChatsClient';
import ChatsLoading from './loading';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'chats' }) : {};
}

export default async function ChatsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PageBreadcrumb locale={locale} page="chats" />
      <React.Suspense fallback={<ChatsLoading />}>
        <ChatDataFetcher />
      </React.Suspense>
    </>
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
