import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { isE2EMode } from '../../support/lib/e2e-mode';
import { IpBlockService } from './ip-block.guard';
import type { Request } from 'express';

interface RequestWithIp {
  ip?: string;
  socket?: { remoteAddress?: string };
}

function extractIp(req: RequestWithIp): string {
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}

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
    this.ipBlockService.record429(extractIp(request));
    return super.throwThrottlingException(context, throttlerLimitDetail);
  }

  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    return Promise.resolve(extractIp(req as RequestWithIp));
  }
}
