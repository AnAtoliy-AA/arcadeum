'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gamesApi } from '@/features/games/api';
import {
  PageLayout,
  Container,
  PageTitle,
  Card,
  Badge,
  LinkButton,
  LoadingState,
  EmptyState,
} from '@/shared/ui';
import { routes } from '@/shared/config/routes';

function getStatusVariant(
  status: string,
): 'success' | 'warning' | 'info' | 'neutral' {
  if (status === 'lobby') return 'success';
  if (status === 'in_progress') return 'warning';
  return 'neutral';
}

export function GameDetailPage() {
  const params = useParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const gameId = params?.id as string;

  const { data: rooms, isLoading: loading } = useQuery({
    queryKey: ['games', 'rooms', gameId],
    queryFn: async () => {
      const response = await gamesApi.getRooms(
        { gameId },
        { token: snapshot.accessToken || undefined },
      );
      return response.rooms;
    },
    enabled: !!gameId,
    initialData: [],
  });

  return (
    <PageLayout>
      <Container size="lg">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <PageTitle size="lg">
            {t('games.detail.title') || 'Game Rooms'}
          </PageTitle>
          <LinkButton
            href={`${routes.gameCreate}?gameId=${gameId}`}
            variant="primary"
          >
            {t('games.common.createRoom') || 'Create Room'}
          </LinkButton>
        </div>

        {loading ? (
          <LoadingState message="Loading rooms..." />
        ) : rooms.length === 0 ? (
          <EmptyState
            message={t('games.detail.empty') || 'No rooms found for this game'}
            icon="🎮"
          />
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {rooms.map((room) => (
              <a
                key={room.id}
                href={routes.gameRoom(room.id)}
                style={{ textDecoration: 'none' }}
              >
              <Card
                interactive
                padding="md"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#ecefee',
                    }}
                  >
                    {room.name}
                  </h3>
                  <Badge variant={getStatusVariant(room.status)} size="sm">
                    {t(`games.rooms.status.${room.status}`) || room.status}
                  </Badge>
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'rgba(236,239,238,0.45)',
                  }}
                >
                  <div>
                    {t('games.rooms.hostedBy', {
                      host: room.host?.displayName || room.hostId,
                    }) || `Hosted by ${room.host?.displayName || room.hostId}`}
                  </div>
                  <div>
                    {room.maxPlayers
                      ? `${room.playerCount}/${room.maxPlayers} players`
                      : `${room.playerCount} players`}
                  </div>
                </div>
              </Card>
              </a>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
