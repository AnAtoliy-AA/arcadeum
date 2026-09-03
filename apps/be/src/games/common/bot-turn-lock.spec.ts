import { BotTurnLock } from './bot-turn-lock';

describe('BotTurnLock', () => {
  it('acquires and releases a key', async () => {
    const lock = new BotTurnLock();
    expect(await lock.tryAcquire('room:bot-a')).toBe(true);
    expect(await lock.tryAcquire('room:bot-a')).toBe(false);
    await lock.release('room:bot-a');
    expect(await lock.tryAcquire('room:bot-a')).toBe(true);
  });

  it('tracks keys independently', async () => {
    const lock = new BotTurnLock();
    expect(await lock.tryAcquire('room:bot-a')).toBe(true);
    expect(await lock.tryAcquire('room:bot-b')).toBe(true);
    expect(await lock.tryAcquire('room:bot-a')).toBe(false);
  });

  it('overrides an expired lock so a hung chain cannot deadlock a room', async () => {
    const lock = new BotTurnLock(60_000);
    const t0 = 1_000_000;
    expect(await lock.tryAcquire('room:bot-a', t0)).toBe(true);
    // Same instant → still locked.
    expect(await lock.tryAcquire('room:bot-a', t0 + 59_999)).toBe(false);
    // Past the TTL → override succeeds.
    expect(await lock.tryAcquire('room:bot-a', t0 + 60_000)).toBe(true);
  });

  it('ageOf reports the current holder age or null', async () => {
    const lock = new BotTurnLock();
    expect(await lock.ageOf('room:bot-a', 1_000)).toBeNull();
    await lock.tryAcquire('room:bot-a', 1_000);
    expect(await lock.ageOf('room:bot-a', 5_000)).toBe(4_000);
    await lock.release('room:bot-a');
    expect(await lock.ageOf('room:bot-a', 6_000)).toBeNull();
  });
});
