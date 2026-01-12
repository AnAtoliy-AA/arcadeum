import { FilterQuery } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { ListRoomsFilters } from './game-rooms.types';

export class GameRoomsQueryBuilder {
  static buildListQuery(filters: ListRoomsFilters): FilterQuery<GameRoom> {
    const query: FilterQuery<GameRoom> = {};

    if (filters.gameId) {
      query.gameId = filters.gameId;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    if (filters.status) {
      query.status = filters.status;
    } else if (filters.statuses && filters.statuses.length > 0) {
      query.status = { $in: filters.statuses };
    }

    if (filters.visibility) {
      if (Array.isArray(filters.visibility)) {
        query.visibility = { $in: filters.visibility };
      } else {
        query.visibility = filters.visibility;
      }
    }

    if (filters.participation && filters.userId) {
      if (
        filters.participation === 'host' ||
        filters.participation === 'hosting'
      ) {
        query.hostId = filters.userId;
      } else if (
        filters.participation === 'participant' ||
        filters.participation === 'joined'
      ) {
        query['participants.userId'] = filters.userId;
        query.hostId = { $ne: filters.userId };
      } else if (filters.participation === 'not_joined') {
        query['participants.userId'] = { $ne: filters.userId };
        query.hostId = { $ne: filters.userId };
      } else if (filters.participation === 'any') {
        query.$or = [
          { hostId: filters.userId },
          { 'participants.userId': filters.userId },
        ];
      }
    }

    return query;
  }
}
