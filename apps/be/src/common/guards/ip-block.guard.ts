import {
  Inject,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isE2EMode } from '../../support/lib/e2e-mode';
import { RATE_STATE_STORE } from '../rate-state';
import type { RateStateStore } from '../rate-state';
import { extractClientIp } from '../utils/client-ip.util';
import type { Request } from 'express';

const BLOCKED_PREFIX = 'ipblock:blocked:';
const FAIL_PREFIX = 'ipblock:fail:';
const ALL_BLOCKED_KEY = 'ipblock:all_blocked';

function parseIpList(raw: string): string[] {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as string[]) : [];
}

function readInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

/**
 * IP block service that tracks failed requests and blocks abusive IPs.
 * Uses a shared RateStateStore for persistence across restarts and instances.
 *
 * Thresholds are configurable via env so ops can tune them without a redeploy:
 *   IP_BLOCK_FAILURE_THRESHOLD   (default 100)  429s within the window
 *   IP_BLOCK_WINDOW_MS           (default 60_000)
 *   IP_BLOCK_DURATION_MS         (default 15 min)
 *   IP_BLOCK_SEVERE_DURATION_MS  (default 60 min)
 */
@Injectable()
export class IpBlockService {
  private readonly failureThreshold: number;
  private readonly failureWindowMs: number;
  private readonly blockDurationMs: number;
  private readonly severeBlockDurationMs: number;
  private readonly trustCloudflare: boolean;

  constructor(
    @Inject(RATE_STATE_STORE) private readonly store: RateStateStore,
    config?: ConfigService,
  ) {
    this.failureThreshold = readInt(
      config?.get('IP_BLOCK_FAILURE_THRESHOLD'),
      100,
    );
    this.failureWindowMs = readInt(config?.get('IP_BLOCK_WINDOW_MS'), 60_000);
    this.blockDurationMs = readInt(
      config?.get('IP_BLOCK_DURATION_MS'),
      15 * 60 * 1000,
    );
    this.severeBlockDurationMs = readInt(
      config?.get('IP_BLOCK_SEVERE_DURATION_MS'),
      60 * 60 * 1000,
    );
    this.trustCloudflare = config?.get('TRUST_CF_CONNECTING_IP') === 'true';
  }

  extractIp(req: Request): string {
    return extractClientIp(req, { trustCloudflare: this.trustCloudflare });
  }

  async record429(ip: string): Promise<void> {
    const count = await this.store.increment(
      FAIL_PREFIX + ip,
      this.failureWindowMs,
    );

    if (count >= this.failureThreshold) {
      await this.block(ip, this.blockDurationMs, 'Repeated 429 responses');
      await this.store.delete(FAIL_PREFIX + ip);
    }
  }

  async recordSevereAbuse(ip: string, reason: string): Promise<void> {
    await this.block(ip, this.severeBlockDurationMs, reason);
    await this.store.delete(FAIL_PREFIX + ip);
    void reason;
  }

  async isBlocked(ip: string): Promise<boolean> {
    const expiresAt = await this.store.get(BLOCKED_PREFIX + ip);
    if (!expiresAt) return false;
    return Date.now() < expiresAt;
  }

  async block(ip: string, durationMs: number, reason: string): Promise<void> {
    const expiresAt = Date.now() + durationMs;
    await this.store.set(BLOCKED_PREFIX + ip, expiresAt, durationMs);
    await this.addToAllBlocked(ip, durationMs);
    void reason;
  }

  async unblock(ip: string): Promise<void> {
    await this.store.delete(BLOCKED_PREFIX + ip);
    await this.removeFromAllBlocked(ip);
  }

  async getBlocked(): Promise<
    Array<{ ip: string; expiresAt: number; reason: string }>
  > {
    const allBlockedRaw = await this.store.getString(ALL_BLOCKED_KEY);
    if (!allBlockedRaw) return [];

    const allBlocked = parseIpList(allBlockedRaw);
    const result: Array<{ ip: string; expiresAt: number; reason: string }> = [];
    const now = Date.now();
    const stillBlocked: string[] = [];

    for (const ip of allBlocked) {
      const expiresAt = await this.store.get(BLOCKED_PREFIX + ip);
      if (!expiresAt || now > expiresAt) continue;
      stillBlocked.push(ip);
      result.push({ ip, expiresAt, reason: '' });
    }

    if (stillBlocked.length !== allBlocked.length) {
      if (stillBlocked.length === 0) {
        await this.store.delete(ALL_BLOCKED_KEY);
      } else {
        await this.store.setString(
          ALL_BLOCKED_KEY,
          JSON.stringify(stillBlocked),
          this.severeBlockDurationMs,
        );
      }
    }

    return result;
  }

  async clearAll(): Promise<void> {
    const allBlockedRaw = await this.store.getString(ALL_BLOCKED_KEY);
    if (allBlockedRaw) {
      const allBlocked = parseIpList(allBlockedRaw);
      for (const ip of allBlocked) {
        await this.store.delete(BLOCKED_PREFIX + ip);
      }
    }
    await this.store.delete(ALL_BLOCKED_KEY);
  }

  private async addToAllBlocked(ip: string, durationMs: number): Promise<void> {
    const raw = await this.store.getString(ALL_BLOCKED_KEY);
    const allBlocked = raw ? parseIpList(raw) : [];
    if (!allBlocked.includes(ip)) {
      allBlocked.push(ip);
      await this.store.setString(
        ALL_BLOCKED_KEY,
        JSON.stringify(allBlocked),
        Math.max(durationMs, this.severeBlockDurationMs),
      );
    }
  }

  private async removeFromAllBlocked(ip: string): Promise<void> {
    const raw = await this.store.getString(ALL_BLOCKED_KEY);
    if (!raw) return;
    const allBlocked = parseIpList(raw);
    const filtered = allBlocked.filter((i) => i !== ip);
    if (filtered.length === 0) {
      await this.store.delete(ALL_BLOCKED_KEY);
    } else {
      await this.store.setString(
        ALL_BLOCKED_KEY,
        JSON.stringify(filtered),
        this.severeBlockDurationMs,
      );
    }
  }
}

@Injectable()
export class IpBlockGuard implements CanActivate {
  constructor(private readonly ipBlockService: IpBlockService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isE2EMode()) return true;

    const request = context.switchToHttp().getRequest<Request>();

    return !(await this.ipBlockService.isBlocked(
      this.ipBlockService.extractIp(request),
    ));
  }
}
