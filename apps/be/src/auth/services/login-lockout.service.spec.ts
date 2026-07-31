import { MemoryRateStateStore } from '../../common/rate-state/rate-state.store';
import { LoginLockoutService } from './login-lockout.service';

describe('LoginLockoutService', () => {
  let store: MemoryRateStateStore;
  let service: LoginLockoutService;

  beforeEach(() => {
    store = new MemoryRateStateStore();
    service = new LoginLockoutService(store);
  });

  it('should not be locked initially', async () => {
    expect(await service.isLocked('user@test.com')).toBe(false);
  });

  it('should return 0 remaining ms when not locked', async () => {
    expect(await service.getLockoutRemainingMs('user@test.com')).toBe(0);
  });

  it('should not lock after fewer than MAX_ATTEMPTS failures', async () => {
    for (let i = 0; i < 4; i++) {
      expect(await service.recordFailure('user@test.com')).toBe(false);
    }
    expect(await service.isLocked('user@test.com')).toBe(false);
  });

  it('should lock after MAX_ATTEMPTS (5) failures', async () => {
    for (let i = 0; i < 5; i++) {
      await service.recordFailure('user@test.com');
    }
    expect(await service.isLocked('user@test.com')).toBe(true);
  });

  it('should return positive remaining ms when locked', async () => {
    for (let i = 0; i < 5; i++) {
      await service.recordFailure('user@test.com');
    }
    const remaining = await service.getLockoutRemainingMs('user@test.com');
    expect(remaining).toBeGreaterThan(0);
  });

  it('should clear state on successful login', async () => {
    for (let i = 0; i < 4; i++) {
      await service.recordFailure('user@test.com');
    }
    await service.recordSuccess('user@test.com');
    expect(await service.isLocked('user@test.com')).toBe(false);
  });

  it('should track different emails independently', async () => {
    for (let i = 0; i < 5; i++) {
      await service.recordFailure('locked@test.com');
    }
    expect(await service.isLocked('locked@test.com')).toBe(true);
    expect(await service.isLocked('other@test.com')).toBe(false);
  });

  it('should share state across service instances using the same store', async () => {
    const service2 = new LoginLockoutService(store);

    for (let i = 0; i < 4; i++) {
      await service.recordFailure('user@test.com');
    }

    expect(await service2.isLocked('user@test.com')).toBe(false);

    await service2.recordFailure('user@test.com');

    expect(await service.isLocked('user@test.com')).toBe(true);
  });

  it('should handle concurrent increments atomically', async () => {
    const promises = Array.from({ length: 10 }, () =>
      service.recordFailure('user@test.com'),
    );
    await Promise.all(promises);

    const locked = await service.isLocked('user@test.com');
    expect(locked).toBe(true);
  });

  it('should apply progressive lockout durations', async () => {
    for (let i = 0; i < 5; i++) {
      await service.recordFailure('user@test.com');
    }
    const remaining1 = await service.getLockoutRemainingMs('user@test.com');
    expect(remaining1).toBeGreaterThan(0);
    expect(remaining1).toBeLessThanOrEqual(5 * 60 * 1000 + 1000);

    await service.recordSuccess('user@test.com');

    for (let i = 0; i < 10; i++) {
      await service.recordFailure('user@test.com');
    }
    const remaining2 = await service.getLockoutRemainingMs('user@test.com');
    expect(remaining2).toBeGreaterThan(5 * 60 * 1000);
  });
});
