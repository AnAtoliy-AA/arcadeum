import { ForbiddenException, Logger } from '@nestjs/common';

export interface CircuitBreakerConfig {
  maxRequestsPerWindow: number;
  windowMs: number;
}

export class DecryptionCircuitBreaker {
  private readonly logger = new Logger(DecryptionCircuitBreaker.name);
  private readonly records = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.maxRequests = config?.maxRequestsPerWindow ?? 30;
    this.windowMs = config?.windowMs ?? 60_000;
  }

  recordAndCheck(actorId: string): void {
    const now = Date.now();
    const timestamps = this.records.get(actorId) ?? [];
    const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      this.logger.error(
        `Decryption circuit breaker tripped for actor ${actorId}. Request count: ${validTimestamps.length}/${this.maxRequests}`,
      );
      throw new ForbiddenException(
        'Decryption rate limit exceeded: security circuit breaker active',
      );
    }

    validTimestamps.push(now);
    this.records.set(actorId, validTimestamps);
    this.cleanupOldRecords(now);
  }

  isActorBlocked(actorId: string): boolean {
    const now = Date.now();
    const timestamps = this.records.get(actorId) ?? [];
    const count = timestamps.filter((ts) => now - ts < this.windowMs).length;
    return count >= this.maxRequests;
  }

  reset(actorId?: string): void {
    if (actorId) {
      this.records.delete(actorId);
    } else {
      this.records.clear();
    }
  }

  private cleanupOldRecords(now: number): void {
    if (this.records.size < 500) return;
    for (const [key, timestamps] of this.records.entries()) {
      const fresh = timestamps.filter((ts) => now - ts < this.windowMs);
      if (fresh.length === 0) {
        this.records.delete(key);
      } else {
        this.records.set(key, fresh);
      }
    }
  }
}
