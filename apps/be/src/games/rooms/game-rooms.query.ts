import { FilterQuery } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { ListRoomsFilters } from './game-rooms.types';
import { escapeRegExp } from '../../common/utils/escape-regexp';
import { validateGameId, isValidStatus } from '../game-validation.util';

export class GameRoomsQueryBuilder {
  static buildListQuery(filters: ListRoomsFilters): FilterQuery<GameRoom> {
    const query: FilterQuery<GameRoom> = {};

    if (filters.gameId) {
      validateGameId(filters.gameId);
      query.gameId = filters.gameId;
    }

    if (filters.categories) {
      const cats = filters.categories.split(',').filter(Boolean);
      if (cats.length === 1) {
        query.category = cats[0];
      } else if (cats.length > 1) {
        query.category = { $in: cats };
      }
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status.includes(',')) {
        const statuses = filters.status.split(',').filter(isValidStatus);
        if (statuses.length > 0) {
          query.status = { $in: statuses };
        }
      } else if (isValidStatus(filters.status)) {
        query.status = filters.status;
      }
    } else if (filters.statuses && filters.statuses.length > 0) {
      const valid = filters.statuses.filter(isValidStatus);
      if (valid.length > 0) {
        query.status = { $in: valid };
      }
    }

    if (filters.visibility) {
      if (Array.isArray(filters.visibility)) {
        query.visibility = { $in: filters.visibility };
      } else {
        query.visibility = filters.visibility;
      }
    }

    if (filters.aiVsAi) {
      query['gameOptions.aiVsAi'] = true;
    }

    let searchOr: FilterQuery<GameRoom>['$or'] | undefined;
    if (filters.search) {
      const escaped = escapeRegExp(filters.search);
      const searchRegex = { $regex: escaped, $options: 'i' };
      searchOr = [{ name: searchRegex }, { inviteCode: filters.search }];
    }

    let anonOr: FilterQuery<GameRoom>['$or'] | undefined;

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
          query.hostId = { $ne: filters.userId, $not: /^anon_/ };
          break;
        case 'any':
          anonOr = [
            { hostId: filters.userId },
            { 'participants.userId': filters.userId },
          ];
          break;
        default:
          anonOr = [
            { hostId: { $not: /^anon_/ } },
            { hostId: filters.userId },
            { 'participants.userId': filters.userId },
          ];
          break;
      }
    } else if (filters.userId) {
      anonOr = [
        { hostId: { $not: /^anon_/ } },
        { hostId: filters.userId },
        { 'participants.userId': filters.userId },
      ];
    } else {
      query.hostId = { ...((query.hostId as object) || {}), $not: /^anon_/ };
    }

    if (searchOr && anonOr) {
      query.$and = [{ $or: searchOr }, { $or: anonOr }];
    } else if (searchOr) {
      query.$or = searchOr;
    } else if (anonOr) {
      query.$or = anonOr;
    }

    return query;
  }
}
