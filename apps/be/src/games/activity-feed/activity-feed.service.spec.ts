import { ActivityFeedService } from './activity-feed.service';
import type { StoredFeedItem } from './activity-feed.mapper';
import type { FeedUserRecord } from './activity-feed.actors';

const ALICE = '64b7f0c2a1b2c3d4e5f60001';
const BOB = '64b7f0c2a1b2c3d4e5f60002';
const GONE = '64b7f0c2a1b2c3d4e5f60003';
const BANNED = '64b7f0c2a1b2c3d4e5f60004';

interface QueryChain<T> {
  sort: jest.Mock<QueryChain<T>, []>;
  limit: jest.Mock<QueryChain<T>, [number]>;
  lean: jest.Mock<QueryChain<T>, []>;
  exec: jest.Mock<Promise<T>, []>;
}

function chain<T>(value: T): QueryChain<T> {
  const q = {} as QueryChain<T>;
  q.sort = jest.fn<QueryChain<T>, []>(() => q);
  q.limit = jest.fn<QueryChain<T>, [number]>(() => q);
  q.lean = jest.fn<QueryChain<T>, []>(() => q);
  q.exec = jest.fn<Promise<T>, []>(() => Promise.resolve(value));
  return q;
}

function row(partial: Partial<StoredFeedItem>, i = 0): StoredFeedItem {
  return {
    _id: { toString: () => `row-${i}` },
    type: 'game_completed',
    userId: ALICE,
    gameId: 'sea_battle_v1',
    detail: '',
    metadata: {},
    createdAt: new Date(Date.UTC(2026, 10, 28, 12, 0, 0) - i * 1000),
    ...partial,
  };
}

const USERS: FeedUserRecord[] = [
  {
    _id: { toString: () => ALICE },
    username: 'alice_u',
    displayName: '  Alice  ',
    role: 'premium',
    equippedAvatarId: 'avatar_fox',
    equippedFrameId: null,
  },
  { _id: { toString: () => BOB }, username: 'bob', displayName: '' },
  {
    _id: { toString: () => GONE },
    username: 'gone',
    deletedAt: new Date(),
  },
  { _id: { toString: () => BANNED }, username: 'banned', isBlocked: true },
];

function makeService(rows: StoredFeedItem[], users = USERS) {
  const feedQuery = chain(rows);
  const feedModel = {
    find: jest.fn<QueryChain<StoredFeedItem[]>, [Record<string, unknown>]>(
      () => feedQuery,
    ),
    create: jest.fn<Promise<void>, [Record<string, unknown>]>(() =>
      Promise.resolve(),
    ),
  };
  const userQuery = chain(users);
  const userModel = {
    find: jest.fn<
      QueryChain<FeedUserRecord[]>,
      [{ _id: { $in: string[] } }, Record<string, number>]
    >(() => userQuery),
  };
  const service = new ActivityFeedService(
    feedModel as never,
    userModel as never,
  );
  return { service, feedModel, feedQuery, userModel };
}

describe('ActivityFeedService.getFeed', () => {
  it('resolves public display names and never leaks emails or raw ids', async () => {
    const { service, userModel } = makeService([
      row({
        metadata: {
          result: 'win',
          opponentIds: [BOB, 'bot-hard-1', 'guest_sock1'],
          score: { actor: 5, opponents: [2, 0, 1] },
          ratingDelta: 14,
          replayId: 'rp-9',
          endReason: 'forfeit',
        },
      }),
    ]);
    const page = await service.getFeed({ limit: 10 });
    const item = page.items[0];

    expect(item.actor).toEqual({
      kind: 'user',
      name: 'Alice',
      profileId: ALICE,
      avatarId: 'avatar_fox',
      frameId: null,
      role: 'premium',
    });
    expect(item.opponents.map((o) => [o.kind, o.name])).toEqual([
      ['user', 'bob'],
      ['bot', null],
      ['guest', null],
    ]);
    expect(item.opponents[1].profileId).toBeNull();
    expect(item.opponents[2].profileId).toBeNull();
    expect(item).toMatchObject({
      result: 'win',
      endReason: 'forfeit',
      score: { actor: 5, opponents: [2, 0, 1] },
      ratingDelta: 14,
      replayId: 'rp-9',
    });

    const serialized = JSON.stringify(page);
    expect(serialized).not.toContain('guest_sock1');
    expect(serialized).not.toContain('bot-hard-1');
    expect(serialized).not.toContain('email');
    expect(serialized).not.toContain('userId');

    // Only registered ids are looked up, with a public-only projection.
    const [filter, projection] = userModel.find.mock.calls[0];
    expect(filter._id.$in.sort()).toEqual([ALICE, BOB].sort());
    expect(projection).not.toHaveProperty('email');
  });

  it('hides deleted and blocked accounts', async () => {
    const { service } = makeService([
      row({ userId: GONE }, 0),
      row({ userId: BANNED }, 1),
    ]);
    const page = await service.getFeed();
    expect(page.items.map((i) => i.actor.kind)).toEqual(['hidden', 'hidden']);
    expect(page.items.every((i) => i.actor.name === null)).toBe(true);
  });

  it('shows guests as anonymous guests', async () => {
    const { service, userModel } = makeService([row({ userId: 'guest_x' })]);
    const page = await service.getFeed();
    expect(page.items[0].actor).toMatchObject({ kind: 'guest', name: null });
    expect(userModel.find).not.toHaveBeenCalled();
  });

  it('maps legacy rows without inventing a winner', async () => {
    const { service } = makeService([
      row({ detail: 'won a game' }, 0),
      row({ detail: 'played a draw' }, 1),
    ]);
    const page = await service.getFeed();
    expect(page.items.map((i) => i.result)).toEqual([null, 'draw']);
  });

  it('reports hasMore and trims the extra row', async () => {
    const rows = [0, 1, 2].map((i) => row({}, i));
    const { service, feedQuery } = makeService(rows);
    const page = await service.getFeed({ limit: 2 });
    expect(feedQuery.limit).toHaveBeenCalledWith(3);
    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(true);
  });

  it('builds filter queries for tabs, games and cursors', async () => {
    const { service, feedModel } = makeService([]);
    await service.getFeed({
      filter: 'wins',
      gameId: 'chess_v1',
      before: '2026-11-28T10:00:00.000Z',
    });
    expect(feedModel.find).toHaveBeenCalledWith({
      type: 'game_completed',
      'metadata.result': 'win',
      gameId: 'chess_v1',
      createdAt: { $lt: new Date('2026-11-28T10:00:00.000Z') },
    });
    await service.getFeed({ filter: 'achievements' });
    expect(feedModel.find).toHaveBeenLastCalledWith({
      type: { $in: ['achievement_unlocked', 'level_up', 'win_streak'] },
    });
  });

  it('still returns rows when the user lookup fails', async () => {
    const { service, userModel } = makeService([row({})]);
    userModel.find.mockImplementation(() => {
      throw new Error('db down');
    });
    const page = await service.getFeed();
    expect(page.items[0].actor.kind).toBe('hidden');
  });
});

describe('ActivityFeedService recording', () => {
  it('never records rows for bots', async () => {
    const { service, feedModel } = makeService([]);
    await service.recordEvent({ type: 'level_up', userId: 'bot-1' });
    expect(feedModel.create).not.toHaveBeenCalled();
  });

  it('records one row per match', async () => {
    const { service, feedModel } = makeService([]);
    await service.recordMatch({
      playerIds: [ALICE, BOB],
      winners: [ALICE],
      gameId: 'chess_v1',
    });
    expect(feedModel.create).toHaveBeenCalledTimes(1);
    expect(feedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'game_completed',
        userId: ALICE,
        metadata: { result: 'win', opponentIds: [BOB] },
      }),
    );
  });

  it('only records level ups from level 2 and streak milestones', async () => {
    const { service, feedModel } = makeService([]);
    await service.recordLevelUp(ALICE, 1);
    await service.recordWinStreak(ALICE, 'chess_v1', 4);
    expect(feedModel.create).not.toHaveBeenCalled();
    await service.recordLevelUp(ALICE, 7);
    await service.recordWinStreak(ALICE, 'chess_v1', 5);
    expect(feedModel.create).toHaveBeenCalledTimes(2);
  });
});
