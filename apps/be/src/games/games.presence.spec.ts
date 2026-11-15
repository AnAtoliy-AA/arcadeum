import type Redis from 'ioredis';
import {
  ONLINE_USERS_KEY,
  OnlinePresence,
  presenceMember,
  presenceUserOf,
} from './games.presence';

function createFakeRedis() {
  return {
    zadd: jest.fn().mockResolvedValue(1),
    zrem: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    zrangebyscore: jest.fn().mockResolvedValue([]),
  };
}

describe('OnlinePresence', () => {
  it('round-trips the user id out of a presence member', () => {
    expect(presenceMember('user-1', 'socket-9')).toBe('user-1|socket-9');
    expect(presenceUserOf('user-1|socket-9')).toBe('user-1');
    expect(presenceUserOf('legacy-user-id')).toBe('legacy-user-id');
  });

  it('tracks sockets in redis and in memory', async () => {
    const fake = createFakeRedis();
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    await presence.track('user-1', 'socket-1');

    expect(fake.zadd).toHaveBeenCalledWith(
      ONLINE_USERS_KEY,
      expect.any(Number),
      'user-1|socket-1',
    );
    expect(presence.getSockets('user-1')).toEqual(new Set(['socket-1']));
  });

  it('keeps memory populated when redis is not configured', async () => {
    const presence = new OnlinePresence(() => null);

    await presence.track('user-1', 'socket-1');
    await presence.track('user-1', 'socket-2');

    expect(presence.getSockets('user-1')).toEqual(
      new Set(['socket-1', 'socket-2']),
    );
    expect(await presence.count()).toBe(1);
  });

  it('refreshes only the heartbeat socket score', async () => {
    const fake = createFakeRedis();
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    await presence.refresh('socket-1', 'user-1');

    expect(fake.zadd).toHaveBeenCalledWith(
      ONLINE_USERS_KEY,
      expect.any(Number),
      'user-1|socket-1',
    );
  });

  it('ignores refreshes without a user id', async () => {
    const fake = createFakeRedis();
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    await presence.refresh('socket-1', '');

    expect(fake.zadd).not.toHaveBeenCalled();
  });

  it('untracks a single socket without dropping the user', async () => {
    const fake = createFakeRedis();
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    await presence.track('user-1', 'socket-1');
    await presence.track('user-1', 'socket-2');
    await presence.untrack('user-1', 'socket-1');

    expect(fake.zrem).toHaveBeenCalledWith(ONLINE_USERS_KEY, 'user-1|socket-1');
    expect(presence.getSockets('user-1')).toEqual(new Set(['socket-2']));
  });

  it('drops the user once its last socket is untracked', async () => {
    const presence = new OnlinePresence(() => null);

    await presence.track('user-1', 'socket-1');
    await presence.untrack('user-1', 'socket-1');

    expect(presence.getSockets('user-1')).toBeUndefined();
    expect(await presence.count()).toBe(0);
  });

  it('prunes stale sockets and counts unique users from redis', async () => {
    const fake = createFakeRedis();
    fake.zrangebyscore.mockResolvedValue([
      'user-1|socket-1',
      'user-1|socket-2',
      'user-2|socket-3',
    ]);
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    const count = await presence.count();

    expect(fake.zremrangebyscore).toHaveBeenCalledWith(
      ONLINE_USERS_KEY,
      '-inf',
      expect.any(String),
    );
    expect(count).toBe(2);
  });

  it('falls back to memory when redis reads fail', async () => {
    const fake = createFakeRedis();
    fake.zremrangebyscore.mockRejectedValue(new Error('redis down'));
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    await presence.track('user-1', 'socket-1');
    await presence.track('user-2', 'socket-2');

    expect(await presence.count()).toBe(2);
  });

  it('reuses the last known count when redis fails and memory is empty', async () => {
    const fake = createFakeRedis();
    fake.zrangebyscore.mockResolvedValue(['user-1|socket-1']);
    const presence = new OnlinePresence(() => fake as unknown as Redis);

    expect(await presence.count()).toBe(1);

    fake.zremrangebyscore.mockRejectedValue(new Error('redis down'));
    expect(await presence.count()).toBe(1);
  });
});
