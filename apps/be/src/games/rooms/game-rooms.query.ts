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
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [{ name: searchRegex }, { inviteCode: filters.search }];
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
      switch (filters.participation) {
        case 'host':
        case 'hosting':
          query.hostId = filters.userId;
          break;
        case 'participant':
        case 'joined':
          query['participants.userId'] = filters.userId;
          query.hostId = { $ne: filters.userId };
          break;
        case 'not_joined':
          query['participants.userId'] = { $ne: filters.userId };
          query.hostId = { $ne: filters.userId };
          break;
        case 'any':
          query.$or = [
            { hostId: filters.userId },
            { 'participants.userId': filters.userId },
          ];
          break;
      }
    }

    if (typeof query.hostId !== 'string') {
      query.hostId = { ...((query.hostId as object) || {}), $not: /^anon_/ };
    }

    return query;
  }
}
