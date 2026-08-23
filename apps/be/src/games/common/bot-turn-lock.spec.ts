import { BotTurnLock } from './bot-turn-lock';

describe('BotTurnLock', () => {
  it('acquires and releases a key', () => {
    const lock = new BotTurnLock();
    expect(lock.tryAcquire('room:bot-a')).toBe(true);
    expect(lock.tryAcquire('room:bot-a')).toBe(false);
    lock.release('room:bot-a');
    expect(lock.tryAcquire('room:bot-a')).toBe(true);
  });

  it('tracks keys independently', () => {
    const lock = new BotTurnLock();
    expect(lock.tryAcquire('room:bot-a')).toBe(true);
    expect(lock.tryAcquire('room:bot-b')).toBe(true);
    expect(lock.tryAcquire('room:bot-a')).toBe(false);
  });

  it('overrides an expired lock so a hung chain cannot deadlock a room', () => {
    const lock = new BotTurnLock(60_000);
    const t0 = 1_000_000;
    expect(lock.tryAcquire('room:bot-a', t0)).toBe(true);
    // Same instant → still locked.
    expect(lock.tryAcquire('room:bot-a', t0 + 59_999)).toBe(false);
    // Past the TTL → override succeeds.
    expect(lock.tryAcquire('room:bot-a', t0 + 60_000)).toBe(true);
  });

  it('ageOf reports the current holder age or null', () => {
    const lock = new BotTurnLock();
    expect(lock.ageOf('room:bot-a', 1_000)).toBeNull();
    lock.tryAcquire('room:bot-a', 1_000);
    expect(lock.ageOf('room:bot-a', 5_000)).toBe(4_000);
    lock.release('room:bot-a');
    expect(lock.ageOf('room:bot-a', 6_000)).toBeNull();
  });
});
