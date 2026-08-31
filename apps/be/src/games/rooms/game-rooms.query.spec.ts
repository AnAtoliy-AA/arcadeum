import { FilterQuery } from 'mongoose';
import { GameRoomsQueryBuilder } from './game-rooms.query';
import { GameRoom } from '../schemas/game-room.schema';
import { ListRoomsFilters } from './game-rooms.types';

type QueryShape = Record<string, unknown>;

const build = (filters: ListRoomsFilters): FilterQuery<GameRoom> & QueryShape =>
  GameRoomsQueryBuilder.buildListQuery(filters);

describe('GameRoomsQueryBuilder', () => {
  it('hides anonymous-hosted rooms from unauthenticated general browsing', () => {
    const query = build({});

    expect(query.hostId).toEqual({ $not: /^anon_/ });
  });

  it('allows own and joined rooms for anonymous user in general browsing', () => {
    const query = build({ userId: 'anon_abc123' });

    expect(query.$or).toEqual([
      { hostId: { $not: /^anon_/ } },
      { hostId: 'anon_abc123' },
      { 'participants.userId': 'anon_abc123' },
    ]);
  });

  it('combines search and anonymous visibility in general browsing', () => {
    const query = build({ userId: 'anon_abc123', search: 'chess' });

    expect(query.$and).toEqual([
      {
        $or: [
          { name: { $options: 'i', $regex: 'chess' } },
          { inviteCode: 'chess' },
        ],
      },
      {
        $or: [
          { hostId: { $not: /^anon_/ } },
          { hostId: 'anon_abc123' },
          { 'participants.userId': 'anon_abc123' },
        ],
      },
    ]);
  });

  it('keeps the anonymous exclusion for not_joined discovery queries', () => {
    const query = build({
      userId: 'anon_abc123',
      participation: 'not_joined',
    });

    expect(query['participants.userId']).toEqual({ $ne: 'anon_abc123' });
    expect(query.hostId).toMatchObject({
      $ne: 'anon_abc123',
      $not: /^anon_/,
    });
  });

  it('shows all own games for an anonymous player with participation=any', () => {
    const query = build({
      userId: 'anon_abc123',
      participation: 'any',
    });

    expect(query.$or).toEqual([
      { hostId: 'anon_abc123' },
      { 'participants.userId': 'anon_abc123' },
    ]);
    expect(query.hostId).toBeUndefined();
  });

  it('shows joined anonymous-hosted rooms for an anonymous player', () => {
    const query = build({
      userId: 'anon_abc123',
      participation: 'joined',
    });

    expect(query['participants.userId']).toBe('anon_abc123');
    expect(query.hostId).toEqual({ $ne: 'anon_abc123' });
  });

  it('returns rooms hosted by an anonymous player for participation=hosting', () => {
    const query = build({
      userId: 'anon_abc123',
      participation: 'hosting',
    });

    expect(query.hostId).toBe('anon_abc123');
  });

  it('shows joined anonymous-hosted rooms for an authenticated player too', () => {
    const query = build({
      userId: 'user-1',
      participation: 'joined',
    });

    expect(query['participants.userId']).toBe('user-1');
    expect(query.hostId).toEqual({ $ne: 'user-1' });
  });

  it('allows own and joined rooms for registered user without participation filter', () => {
    const query = build({ userId: 'user-1' });

    expect(query.$or).toEqual([
      { hostId: { $not: /^anon_/ } },
      { hostId: 'user-1' },
      { 'participants.userId': 'user-1' },
    ]);
  });

  it('filters by single status', () => {
    const query = build({ status: 'in_progress' });
    expect(query.status).toBe('in_progress');
  });

  it('filters by multiple comma-separated statuses', () => {
    const query = build({ status: 'lobby,in_progress' });
    expect(query.status).toEqual({ $in: ['lobby', 'in_progress'] });
  });

  it('does not filter status when status is all', () => {
    const query = build({ status: 'all' });
    expect(query.status).toBeUndefined();
  });
});
