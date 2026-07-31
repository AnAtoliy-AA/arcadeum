import { Inject, Injectable } from '@nestjs/common';
import { RATE_STATE_STORE } from '../../common/rate-state';
import type { RateStateStore } from '../../common/rate-state';

const ATTEMPTS_PREFIX = 'lockout:count:';
const LOCKED_UNTIL_PREFIX = 'lockout:until:';

/**
 * Tracks failed login attempts per account and enforces progressive lockout.
 * Uses a shared RateStateStore for persistence across restarts and instances.
 */
@Injectable()
export class LoginLockoutService {
  constructor(
    @Inject(RATE_STATE_STORE) private readonly store: RateStateStore,
  ) {}

  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly LOCK_DURATIONS_MS = [
    5 * 60 * 1000, // 5 min after 5 failures
    15 * 60 * 1000, // 15 min after 10 failures
    60 * 60 * 1000, // 1 hour after 15 failures
  ];

  async isLocked(email: string): Promise<boolean> {
    const lockedUntil = await this.store.get(LOCKED_UNTIL_PREFIX + email);
    if (!lockedUntil) return false;
    return Date.now() < lockedUntil;
  }

  async getLockoutRemainingMs(email: string): Promise<number> {
    const lockedUntil = await this.store.get(LOCKED_UNTIL_PREFIX + email);
    if (!lockedUntil) return 0;
    return Math.max(0, lockedUntil - Date.now());
  }

  async recordFailure(email: string): Promise<boolean> {
    const count = await this.store.increment(
      ATTEMPTS_PREFIX + email,
      this.WINDOW_MS,
    );

    if (count >= this.MAX_ATTEMPTS) {
      const lockIndex = Math.min(
        Math.floor((count - this.MAX_ATTEMPTS) / this.MAX_ATTEMPTS),
        this.LOCK_DURATIONS_MS.length - 1,
      );
      const lockDuration = this.LOCK_DURATIONS_MS[lockIndex];
      const lockedUntil = Date.now() + lockDuration;
      await this.store.set(
        LOCKED_UNTIL_PREFIX + email,
        lockedUntil,
        lockDuration,
      );
      return true;
    }

    return false;
  }

  async recordSuccess(email: string): Promise<void> {
    await Promise.all([
      this.store.delete(ATTEMPTS_PREFIX + email),
      this.store.delete(LOCKED_UNTIL_PREFIX + email),
    ]);
  }
}
