import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { ThrottlerStorage } from '@nestjs/throttler';
import {
  THROTTLER_LIMIT,
  THROTTLER_SKIP,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import type { Resolvable } from '@nestjs/throttler/dist/throttler-module-options.interface';
import { Reflector } from '@nestjs/core';
import { isE2EMode } from '../../support/lib/e2e-mode';
import { IpBlockService } from './ip-block.guard';
import { extractClientIp } from '../utils/client-ip.util';
import type { Request } from 'express';

/**
 * Named throttlers (`auth`, `strict`) are opt-in: they only apply to routes
 * that explicitly declare limits via `@Throttle({ [name]: ... })`. Without
 * this, every registered throttler silently applies to every route — which
 * is how the 5 req/hour `strict` bucket ended up on all endpoints (health
 * checks included) and hard-banned clients for a full hour.
 */
const GLOBAL_THROTTLER_NAME = 'default';

@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
  private readonly trustCloudflare: boolean;

  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly ipBlockService: IpBlockService,
    config: ConfigService,
  ) {
    super(options, storageService, reflector);
    this.trustCloudflare = config.get('TRUST_CF_CONNECTING_IP') === 'true';
  }

  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    // The IP-based tracker has no meaning for WebSocket message handlers
    // (there is no HTTP request, so every socket event resolves to the same
    // 'unknown' bucket). Worse, 429s from that shared bucket feed the
    // auto-blocker, so one noisy socket could block ALL realtime users.
    // Per-socket rate limiting should be implemented in the gateways
    // themselves if needed.
    if (context.getType<'ws' | 'http'>() !== 'http') {
      return Promise.resolve(true);
    }
    return Promise.resolve(isE2EMode());
  }

  /**
   * Mirrors ThrottlerGuard.canActivate but skips named throttlers that the
   * route has not opted into via @Throttle metadata. The `default` throttler
   * always applies unless the route skips it with @SkipThrottle.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classRef = context.getClass();

    if (await this.shouldSkip(context)) {
      return true;
    }

    const continues: boolean[] = [];
    for (const namedThrottler of this.throttlers) {
      const name: string = namedThrottler.name ?? GLOBAL_THROTTLER_NAME;

      const skip = this.reflector.getAllAndOverride<boolean>(
        THROTTLER_SKIP + name,
        [handler, classRef],
      );
      const skipIf = namedThrottler.skipIf ?? this.commonOptions.skipIf;
      if (skip || skipIf?.(context)) {
        continues.push(true);
        continue;
      }

      const routeOrClassLimit = this.reflector.getAllAndOverride<number>(
        THROTTLER_LIMIT + name,
        [handler, classRef],
      );
      const routeOrClassTtl = this.reflector.getAllAndOverride<number>(
        THROTTLER_TTL + name,
        [handler, classRef],
      );

      if (
        name !== GLOBAL_THROTTLER_NAME &&
        routeOrClassLimit === undefined &&
        routeOrClassTtl === undefined
      ) {
        continue;
      }

      const getTracker = (
        req: Record<string, unknown>,
        _context: ExecutionContext,
      ): Promise<string> =>
        Promise.resolve(this.extractIp(req as unknown as Request));
      const generateKey = (
        ctx: ExecutionContext,
        suffix: string,
        keyName: string,
      ): string => super.generateKey(ctx, suffix, keyName);

      continues.push(
        await this.handleRequest({
          context,
          limit:
            routeOrClassLimit ??
            (await this.resolveNumber(context, namedThrottler.limit)),
          ttl:
            routeOrClassTtl ??
            (await this.resolveNumber(context, namedThrottler.ttl)),
          throttler: namedThrottler,
          blockDuration:
            (await this.resolveNumber(context, namedThrottler.blockDuration)) ||
            routeOrClassTtl ||
            (await this.resolveNumber(context, namedThrottler.ttl)),
          getTracker,
          generateKey,
        }),
      );
    }

    return continues.every((cont) => cont);
  }

  private async resolveNumber(
    context: ExecutionContext,
    value: Resolvable<number> | undefined,
  ): Promise<number> {
    const resolved =
      typeof value === 'function' ? await value(context) : (value ?? 0);
    return resolved;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request ? this.extractIp(request) : '';
    // Never feed an unresolvable identity into the auto-blocker — that
    // would block every unidentified client (e.g. all sockets) at once.
    if (ip && ip !== 'unknown') {
      void this.ipBlockService.record429(ip);
    }
    return super.throwThrottlingException(context, throttlerLimitDetail);
  }

  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    // The throttler hands us a generic object; the Express request shape is
    // known at runtime. Cast via `unknown` to satisfy TS's overlap check.
    return Promise.resolve(this.extractIp(req as unknown as Request));
  }

  private extractIp(req: Request): string {
    return extractClientIp(req, { trustCloudflare: this.trustCloudflare });
  }
}
