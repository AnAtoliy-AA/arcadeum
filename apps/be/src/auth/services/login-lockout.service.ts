import { Injectable } from '@nestjs/common';

interface FailedAttempt {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

/**
 * Tracks failed login attempts per account and enforces progressive lockout.
 * In-memory — resets on server restart (acceptable for brute-force protection).
 */
@Injectable()
export class LoginLockoutService {
  private readonly attempts = new Map<string, FailedAttempt>();

  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly LOCK_DURATIONS_MS = [
    5 * 60 * 1000, // 5 min after 5 failures
    15 * 60 * 1000, // 15 min after 10 failures
    60 * 60 * 1000, // 1 hour after 15 failures
  ];

  /**
   * Returns true if the account is currently locked.
   */
  isLocked(email: string): boolean {
    const entry = this.attempts.get(email);
    if (!entry?.lockedUntil) return false;

    if (Date.now() > entry.lockedUntil) {
      entry.lockedUntil = null;
      entry.count = 0;
      return false;
    }
    return true;
  }

  /**
   * Returns the remaining lockout duration in ms, or 0 if not locked.
   */
  getLockoutRemainingMs(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry?.lockedUntil) return 0;
    return Math.max(0, entry.lockedUntil - Date.now());
  }

  /**
   * Record a failed login attempt. Returns true if the account is now locked.
   */
  recordFailure(email: string): boolean {
    const now = Date.now();
    let entry = this.attempts.get(email);

    if (!entry || now - entry.windowStart > this.WINDOW_MS) {
      entry = { count: 1, windowStart: now, lockedUntil: null };
      this.attempts.set(email, entry);
      return false;
    }

    entry.count++;

    if (entry.count >= this.MAX_ATTEMPTS) {
      const lockIndex = Math.min(
        Math.floor((entry.count - this.MAX_ATTEMPTS) / this.MAX_ATTEMPTS),
        this.LOCK_DURATIONS_MS.length - 1,
      );
      entry.lockedUntil = now + this.LOCK_DURATIONS_MS[lockIndex];
      return true;
    }

    return false;
  }

  /**
   * Clear failed attempts on successful login.
   */
  recordSuccess(email: string): void {
    this.attempts.delete(email);
  }
}
