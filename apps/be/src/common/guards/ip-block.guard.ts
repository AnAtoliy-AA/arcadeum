import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { isE2EMode } from '../../support/lib/e2e-mode';
import type { Request } from 'express';

interface BlockedEntry {
  expiresAt: number;
  reason: string;
}

@Injectable()
export class IpBlockService {
  private readonly blocked = new Map<string, BlockedEntry>();
  private readonly failureCounts = new Map<
    string,
    { count: number; windowStart: number }
  >();

  private readonly FAILURE_THRESHOLD = 50;
  private readonly FAILURE_WINDOW_MS = 60_000;
  private readonly BLOCK_DURATION_MS = 15 * 60 * 1000;
  private readonly SEVERE_BLOCK_DURATION_MS = 60 * 60 * 1000;

  record429(ip: string): void {
    const now = Date.now();
    const entry = this.failureCounts.get(ip);

    if (!entry || now - entry.windowStart > this.FAILURE_WINDOW_MS) {
      this.failureCounts.set(ip, { count: 1, windowStart: now });
      return;
    }

    entry.count++;
    if (entry.count >= this.FAILURE_THRESHOLD) {
      this.block(ip, this.BLOCK_DURATION_MS, 'Repeated 429 responses');
      this.failureCounts.delete(ip);
    }
  }

  recordSevereAbuse(ip: string, reason: string): void {
    this.block(ip, this.SEVERE_BLOCK_DURATION_MS, reason);
    this.failureCounts.delete(ip);
  }

  isBlocked(ip: string): boolean {
    const entry = this.blocked.get(ip);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.blocked.delete(ip);
      return false;
    }
    return true;
  }

  block(ip: string, durationMs: number, reason: string): void {
    this.blocked.set(ip, {
      expiresAt: Date.now() + durationMs,
      reason,
    });
  }

  unblock(ip: string): boolean {
    return this.blocked.delete(ip);
  }

  getBlocked(): Array<{ ip: string; expiresAt: number; reason: string }> {
    const now = Date.now();
    const result: Array<{ ip: string; expiresAt: number; reason: string }> = [];

    for (const [ip, entry] of this.blocked) {
      if (now > entry.expiresAt) {
        this.blocked.delete(ip);
      } else {
        result.push({ ip, expiresAt: entry.expiresAt, reason: entry.reason });
      }
    }
    return result;
  }

  clearAll(): void {
    this.blocked.clear();
    this.failureCounts.clear();
  }
}

@Injectable()
export class IpBlockGuard implements CanActivate {
  constructor(private readonly ipBlockService: IpBlockService) {}

  canActivate(context: ExecutionContext): boolean {
    if (isE2EMode()) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';

    return !this.ipBlockService.isBlocked(ip);
  }
}
