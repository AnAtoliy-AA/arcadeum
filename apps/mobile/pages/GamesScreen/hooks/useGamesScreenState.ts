import { useCallback, useState } from 'react';
import type { GameRoomSummary } from '../api/gamesApi';
import type {
  InvitePromptState,
  StatusFilterValue,
  ParticipationFilterValue,
} from '../types';

export function useGamesScreenState() {
  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsRefreshing, setRoomsRefreshing] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [invitePrompt, setInvitePrompt] = useState<InvitePromptState>({
    visible: false,
    room: null,
    mode: 'room',
    loading: false,
    error: null,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [participationFilter, setParticipationFilter] =
    useState<ParticipationFilterValue>('all');

  const updateRoomList = useCallback((room: GameRoomSummary) => {
    setRooms((current) => {
      const next = [...current];
      const existingIndex = next.findIndex(
        (existing) => existing.id === room.id,
      );
      if (existingIndex >= 0) {
        next[existingIndex] = room;
        return next;
      }
      return [room, ...next];
    });
  }, []);

  return {
    rooms,
    setRooms,
    roomsLoading,
    setRoomsLoading,
    roomsRefreshing,
    setRoomsRefreshing,
    roomsError,
    setRoomsError,
    joiningRoomId,
    setJoiningRoomId,
    invitePrompt,
    setInvitePrompt,
    statusFilter,
    setStatusFilter,
    participationFilter,
    setParticipationFilter,
    updateRoomList,
  };
}
