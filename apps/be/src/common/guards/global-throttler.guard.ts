import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { isE2EMode } from '../../support/lib/e2e-mode';
import { IpBlockService } from './ip-block.guard';
import { extractClientIp } from '../utils/client-ip.util';
import type { Request } from 'express';

@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly ipBlockService: IpBlockService,
  ) {
    super(options, storageService, reflector);
  }

  protected shouldSkip(): Promise<boolean> {
    return Promise.resolve(isE2EMode());
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    void this.ipBlockService.record429(extractClientIp(request));
    return super.throwThrottlingException(context, throttlerLimitDetail);
  }

  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    // The throttler hands us a generic object; the Express request shape is
    // known at runtime. Cast via `unknown` to satisfy TS's overlap check.
    return Promise.resolve(extractClientIp(req as unknown as Request));
  }
}
