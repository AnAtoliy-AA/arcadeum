/**
 * WebSocket rate limiter for game gateways.
 * Provides per-socket rate limiting with configurable windows and limits.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 10_000, // 10 seconds
};

export class SocketRateLimiter {
  private readonly limits = new Map<string, RateLimitEntry>();
  private readonly config: RateLimitConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Cleanup stale entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  /**
   * Check if a request from the given socket ID is allowed.
   * Returns true if allowed, false if rate limited.
   */
  isAllowed(socketId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(socketId);

    if (!entry || now >= entry.resetAt) {
      // New window or expired window
      this.limits.set(socketId, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limited
      return false;
    }

    // Increment count
    entry.count += 1;
    return true;
  }

  /**
   * Remove a socket's rate limit entry (call on disconnect).
   */
  remove(socketId: string): void {
    this.limits.delete(socketId);
  }

  /**
   * Get remaining requests for a socket.
   */
  getRemaining(socketId: string): number {
    const now = Date.now();
    const entry = this.limits.get(socketId);

    if (!entry || now >= entry.resetAt) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - entry.count);
  }

  /**
   * Get time until the window resets for a socket (in ms).
   */
  getResetMs(socketId: string): number {
    const entry = this.limits.get(socketId);
    if (!entry) return 0;
    return Math.max(0, entry.resetAt - Date.now());
  }

  /**
   * Cleanup stale entries to prevent memory leaks.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [socketId, entry] of this.limits.entries()) {
      if (now >= entry.resetAt) {
        this.limits.delete(socketId);
      }
    }
  }

  /**
   * Destroy the rate limiter (clear cleanup interval).
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

/**
 * Create a rate limiter for game actions (moves, plays, etc.).
 * More restrictive than the general limiter.
 */
export function createGameActionLimiter(): SocketRateLimiter {
  return new SocketRateLimiter({
    maxRequests: 20,
    windowMs: 10_000, // 20 moves per 10 seconds
  });
}

/**
 * Create a rate limiter for chat messages.
 */
export function createChatRateLimiter(): SocketRateLimiter {
  return new SocketRateLimiter({
    maxRequests: 5,
    windowMs: 10_000, // 5 messages per 10 seconds
  });
}

/**
 * Create a rate limiter for room operations (join, leave, etc.).
 */
export function createRoomRateLimiter(): SocketRateLimiter {
  return new SocketRateLimiter({
    maxRequests: 10,
    windowMs: 10_000, // 10 operations per 10 seconds
  });
}
