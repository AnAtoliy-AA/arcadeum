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

    if (filters.search) {
      const escaped = escapeRegExp(filters.search);
      const searchRegex = { $regex: escaped, $options: 'i' };
      query.$or = [{ name: searchRegex }, { inviteCode: filters.search }];
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

    // Anonymous-hosted rooms are hidden from general browsing, but never from
    // queries scoped to the viewer's own participation — an anon player must
    // still see rooms they host or joined (including other anon-hosted ones).
    const isViewerParticipationFilter =
      Boolean(filters.userId) &&
      (filters.participation === 'host' ||
        filters.participation === 'hosting' ||
        filters.participation === 'participant' ||
        filters.participation === 'joined' ||
        filters.participation === 'any');

    if (!isViewerParticipationFilter && typeof query.hostId !== 'string') {
      query.hostId = { ...((query.hostId as object) || {}), $not: /^anon_/ };
    }

    return query;
  }
}
