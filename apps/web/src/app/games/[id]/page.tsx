import type { Metadata } from 'next';

import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { gameMetadata } from '@/features/games/gameMetadata';
import type { GameSlug } from '@/features/games/registry.types';
import type { GameRoomSummary } from '@/shared/types/games';
import { SSR_TIMEOUT, appConfig } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, gameSchema, webPage } from '@/shared/seo/jsonLd';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import GameDetailClient from './GameDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

function lookupGameMeta(id: string) {
  return gameMetadata[id as GameSlug];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const meta = lookupGameMeta(id);
  const name = meta?.name ?? 'Game';
  const description =
    meta?.description ??
    `Play ${name} online on ${appConfig.appName}. Join a room or invite friends to start a match.`;

  return buildMetadata({
    title: name,
    description,
    path: routes.gameDetail(id),
    image: meta?.thumbnail,
    keywords: [
      `${name.toLowerCase()}`,
      `play ${name.toLowerCase()} online`,
      `${name.toLowerCase()} board game`,
      ...(meta?.tags ?? []),
    ],
    locale,
  });
}

export default async function GameDetailRoute({ params }: PageProps) {
  const { id: gameId } = await params;
  const accessToken = await getServerAccessToken();
  const meta = lookupGameMeta(gameId);

  let initialRooms: GameRoomSummary[] = [];
  try {
    const response = await gamesApi.getRooms(
      { gameId },
      { token: accessToken || undefined, timeout: SSR_TIMEOUT },
    );
    initialRooms = response.rooms;
  } catch (error) {
    handleSsrFetchError(`rooms for game ${gameId}`, error);
  }

  const jsonLd = [
    breadcrumbList([
      { name: 'Home', path: routes.home },
      { name: 'Games', path: routes.games },
      { name: meta?.name ?? 'Game', path: routes.gameDetail(gameId) },
    ]),
    meta
      ? gameSchema({
          id: gameId,
          name: meta.name,
          description: meta.description,
          image: meta.thumbnail,
          minPlayers: meta.minPlayers,
          maxPlayers: meta.maxPlayers,
          playMode: 'MultiPlayer',
        })
      : webPage({
          name: 'Game Details',
          path: routes.gameDetail(gameId),
        }),
  ];

  const crumbName = meta?.name ?? 'Game';

  return (
    <>
      <JsonLd data={jsonLd} />
      <div style={{ padding: '1rem 1.5rem 0' }}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home },
            { label: 'Games', href: routes.games },
            { label: crumbName },
          ]}
        />
      </div>
      <GameDetailClient initialRooms={initialRooms} />
    </>
  );
}
