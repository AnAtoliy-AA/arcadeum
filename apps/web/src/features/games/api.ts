import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import type { GameRoomSummary } from '@/shared/types/games';

interface GetRoomsParams {
  status?: string;
  participation?: string;
  search?: string;
  page?: number;
  limit?: number;
  gameId?: string;
}

export interface GetRoomsResponse {
  rooms: GameRoomSummary[];
  total: number;
}

interface CreateRoomPayload {
  gameId: string;
  name: string;
  visibility: 'public' | 'private';
  maxPlayers?: number;
  notes?: string;
  gameOptions?: Record<string, unknown>;
}

interface CreateRoomResponse {
  room: GameRoomSummary;
}

interface RoomVisibilityResponse {
  room: {
    visibility: 'public' | 'private';
  };
}

// Helper type guards
function isRoomsResponse(data: unknown): data is { rooms: unknown[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'rooms' in data &&
    Array.isArray((data as { rooms: unknown }).rooms)
  );
}

function isPagedResponse(
  data: unknown,
): data is { rooms: unknown[]; total: number } {
  return (
    isRoomsResponse(data) &&
    'total' in data &&
    typeof (data as { total: unknown }).total === 'number'
  );
}

export const gamesApi = {
  getRooms: async (
    params: GetRoomsParams = {},
    options?: ApiClientOptions,
  ): Promise<GetRoomsResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'all'
      ) {
        return;
      }
      searchParams.append(key, String(value));
    });

    const data = await apiClient.get<unknown>(
      `/games/rooms?${searchParams.toString()}`,
      options,
    );

    if (isPagedResponse(data)) {
      return {
        rooms: data.rooms as GameRoomSummary[],
        total: data.total,
      };
    }

    if (isRoomsResponse(data)) {
      return {
        rooms: data.rooms as GameRoomSummary[],
        total: data.rooms.length,
      };
    }

    if (Array.isArray(data)) {
      return { rooms: data as GameRoomSummary[], total: data.length };
    }

    return { rooms: [], total: 0 };
  },

  getRoomVisibility: async (
    roomId: string,
    options?: ApiClientOptions,
  ): Promise<'public' | 'private'> => {
    try {
      const data = await apiClient.get<RoomVisibilityResponse>(
        `/games/rooms/${roomId}`,
        options,
      );
      return data.room?.visibility || 'public';
    } catch (err: unknown) {
      // Re-throw specific errors for the UI
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status: number }).status;
        if (status === HttpStatus.FORBIDDEN)
          throw new Error('private_room_error');
        if (
          status === HttpStatus.NOT_FOUND ||
          status === HttpStatus.INTERNAL_SERVER_ERROR
        )
          throw new Error('room_not_found_error');
      }
      throw new Error('failed_to_load_error');
    }
  },

  createRoom: async (
    payload: CreateRoomPayload,
    options?: ApiClientOptions,
  ): Promise<CreateRoomResponse> => {
    return apiClient.post<CreateRoomResponse>('/games/rooms', payload, options);
  },
};
