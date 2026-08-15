import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import GameRoomClient from './GameRoomClient';
import GameRoomLoading from './loading';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  return buildPageMetadata({
    locale,
    page: 'gameRoom',
    pathFor: (r) => r.gameRoom(id),
  });
}

export default async function GameRoomRoute({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<GameRoomLoading />}>
      <RoomDataFetcher id={resolvedParams.id} />
    </Suspense>
  );
}

async function RoomDataFetcher({ id }: { id: string }) {
  const accessToken = await getServerAccessToken();

  // Initial fetch on server
  let initialData = null;
  try {
    initialData = await gamesApi.getRoomInfo(id, {
      token: accessToken || undefined,
      timeout: SSR_TIMEOUT,
    });
  } catch (error) {
    handleSsrFetchError(`room info for ${id}`, error);
  }

  return (
    <GameRoomClient
      params={Promise.resolve({ id })}
      initialData={initialData}
    />
  );
}
