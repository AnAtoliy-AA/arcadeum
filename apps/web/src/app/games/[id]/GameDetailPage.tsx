'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useTranslation } from '@/shared/lib/useTranslation';
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

const RoomCard = styled(Card).attrs({ interactive: true, padding: 'md' })`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const RoomTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const RoomMeta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: 'public' | 'private';
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: 'lobby' | 'in_progress' | 'completed';
  host?: {
    id: string;
    displayName: string;
  };
}

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

  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const url = resolveApiUrl(`/games/rooms?gameId=${gameId}`);
      const headers: HeadersInit = {};

      if (snapshot.accessToken) {
        headers.Authorization = `Bearer ${snapshot.accessToken}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId, snapshot.accessToken]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <PageLayout>
      <Container size="lg">
        <HeaderActions>
          <PageTitle size="lg">
            {t('games.detail.title') || 'Game Rooms'}
          </PageTitle>
          <LinkButton href={`/games/create?gameId=${gameId}`} variant="primary">
            {t('games.common.createRoom') || 'Create Room'}
          </LinkButton>
        </HeaderActions>

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
              <RoomCard key={room.id} as="a" href={`/games/rooms/${room.id}`}>
                <RoomHeader>
                  <RoomTitle>{room.name}</RoomTitle>
                  <Badge variant={getStatusVariant(room.status)} size="sm">
                    {t(`games.rooms.status.${room.status}`) || room.status}
                  </Badge>
                </RoomHeader>
                <RoomMeta>
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
                </RoomMeta>
              </RoomCard>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
