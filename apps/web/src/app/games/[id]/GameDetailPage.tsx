'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gamesApi } from '@/features/games/api';
import { XStack, YStack } from 'tamagui';
import {
  PageLayout,
  Container,
  PageTitle,
  Card,
  Badge,
  LinkButton,
  LoadingState,
  EmptyState,
  Typography,
} from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import type { GameRoomSummary } from '@/shared/types/games';

function getStatusVariant(
  status: string,
): 'success' | 'warning' | 'info' | 'neutral' {
  if (status === 'lobby') return 'success';
  if (status === 'in_progress') return 'warning';
  return 'neutral';
}

interface GameDetailPageProps {
  initialRooms?: GameRoomSummary[];
}

export default function GameDetailPage({
  initialRooms = [],
}: GameDetailPageProps) {
  const params = useParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const gameId = params?.id as string;

  const { data: rooms = [], isLoading: loading } = useQuery<GameRoomSummary[]>({
    queryKey: ['games', 'rooms', gameId, snapshot.accessToken],
    queryFn: async () => {
      const response = await gamesApi.getRooms(
        { gameId },
        { token: snapshot.accessToken || undefined },
      );
      return response.rooms;
    },
    enabled: !!gameId,
    initialData: initialRooms,
    refreshKey: `game-detail-${gameId}`,
  });

  const displayRooms = rooms || [];

  return (
    <PageLayout>
      <Container size="lg">
        <XStack jc="space-between" ai="center" gap="$4" mb="$6">
          <PageTitle size="lg">
            {t('games.detail.title') || 'Game Rooms'}
          </PageTitle>
          <LinkButton
            href={`${routes.gameCreate}?gameId=${gameId}`}
            variant="primary"
          >
            {t('games.common.createRoom') || 'Create Room'}
          </LinkButton>
        </XStack>

        {loading && !displayRooms.length ? (
          <LoadingState message="Loading rooms..." />
        ) : displayRooms.length === 0 ? (
          <EmptyState
            message={t('games.detail.empty') || 'No rooms found for this game'}
            icon="🎮"
          />
        ) : (
          <YStack gap="$4">
            {displayRooms.map((room) => (
              <Link
                key={room.id}
                href={routes.gameRoom(room.id)}
                style={{ textDecoration: 'none' }}
              >
                <Card interactive padding="md">
                  <YStack gap="$3">
                    <XStack jc="space-between" ai="center" gap="$4">
                      <Typography
                        asChild
                        uiSize="lg"
                        fontWeight="600"
                        color="$color"
                      >
                        <h3 style={{ margin: 0 }}>{room.name}</h3>
                      </Typography>
                      <Badge variant={getStatusVariant(room.status)} size="sm">
                        {t(`games.rooms.status.${room.status}`) || room.status}
                      </Badge>
                    </XStack>
                    <YStack gap="$1">
                      <Typography variant="body" uiSize="sm" alpha="medium">
                        {t('games.rooms.hostedBy', {
                          host: room.host?.displayName || room.hostId,
                        }) ||
                          `Hosted by ${room.host?.displayName || room.hostId}`}
                      </Typography>
                      <Typography variant="body" uiSize="sm" alpha="medium">
                        {room.maxPlayers
                          ? `${room.playerCount}/${room.maxPlayers} players`
                          : `${room.playerCount} players`}
                      </Typography>
                    </YStack>
                  </YStack>
                </Card>
              </Link>
            ))}
          </YStack>
        )}
      </Container>
    </PageLayout>
  );
}
