import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { GameRoomSummary } from '../api/gamesApi';
import { RoomCard } from './RoomCard';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

type RoomsListProps = {
  rooms: GameRoomSummary[];
  loading: boolean;
  error: string | null;
  joiningRoomId: string | null;
  filtersActive: boolean;
  onJoinRoom: (room: GameRoomSummary) => void;
  onWatchRoom: (room: GameRoomSummary) => void;
  onRetry: () => void;
  userId?: string | null;
};

export function RoomsList({
  rooms,
  loading,
  error,
  joiningRoomId,
  filtersActive,
  onJoinRoom,
  onWatchRoom,
  onRetry,
  userId,
}: RoomsListProps) {
  const sortedRooms = useMemo(() => {
    if (!rooms.length) return [];
    return [...rooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const canWatch = (room: GameRoomSummary) => {
    return room.visibility === 'public' || Boolean(userId);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (sortedRooms.length === 0) {
    return <EmptyState filtersActive={filtersActive} />;
  }

  return (
    <View style={{ gap: 12 }}>
      {sortedRooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isJoining={joiningRoomId === room.id}
          onJoin={() => onJoinRoom(room)}
          onWatch={() => onWatchRoom(room)}
          canWatch={canWatch(room)}
          userId={userId ?? undefined}
        />
      ))}
    </View>
  );
}
