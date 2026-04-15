'use client';

import { useQuery } from '@/shared/hooks/useQuery';
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

export function GameDetailPage({ initialRooms = [] }: GameDetailPageProps) {
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

        {loading && !displayRooms.length ? (
          <LoadingState message="Loading rooms..." />
        ) : displayRooms.length === 0 ? (
          <EmptyState
            message={t('games.detail.empty') || 'No rooms found for this game'}
            icon="🎮"
          />
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {displayRooms.map((room) => (
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
                      }) ||
                        `Hosted by ${room.host?.displayName || room.hostId}`}
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
