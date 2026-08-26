import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  SkipThrottle,
  Throttle,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { GlobalThrottlerGuard } from './global-throttler.guard';
import { IpBlockService } from './ip-block.guard';
import { MemoryRateStateStore } from '../rate-state/rate-state.store';
import type { Request, Response } from 'express';

const OPTIONS = [
  { name: 'default', ttl: 60_000, limit: 100 },
  { name: 'auth', ttl: 60_000, limit: 10 },
  {
    name: 'strict',
    ttl: 3_600_000,
    limit: 5,
    blockDuration: 60_000,
  },
];

function createContext(
  handler: (req: unknown) => string | undefined,
  controllerClass: abstract new () => unknown,
  ip = '1.2.3.4',
  type = 'http',
): ExecutionContext {
  const req = {
    ip,
    headers: {},
    socket: { remoteAddress: ip },
  } as unknown as Request;
  const res = { header: () => res } as unknown as Response;
  return {
    getType: () => type,
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    getHandler: () => handler,
    getClass: () => controllerClass,
  } as unknown as ExecutionContext;
}

class PlainController {
  handler(): string {
    return 'ok';
  }
}

class StrictController {
  handler(): string {
    return 'ok';
  }
}
Throttle({ strict: { limit: 5, ttl: 3_600_000 } })(
  StrictController.prototype,
  'handler',
  Object.getOwnPropertyDescriptor(StrictController.prototype, 'handler')!,
);

class SkippedDefaultWithStrictController {
  handler(): string {
    return 'ok';
  }
}
SkipThrottle({ default: true })(
  SkippedDefaultWithStrictController.prototype,
  'handler',
  Object.getOwnPropertyDescriptor(
    SkippedDefaultWithStrictController.prototype,
    'handler',
  )!,
);
Throttle({ strict: { limit: 5, ttl: 3_600_000 } })(
  SkippedDefaultWithStrictController.prototype,
  'handler',
  Object.getOwnPropertyDescriptor(
    SkippedDefaultWithStrictController.prototype,
    'handler',
  )!,
);

class LowLimitStrictController {
  handler(): string {
    return 'ok';
  }
}
Throttle({ strict: { limit: 2, ttl: 3_600_000 } })(
  LowLimitStrictController.prototype,
  'handler',
  Object.getOwnPropertyDescriptor(
    LowLimitStrictController.prototype,
    'handler',
  )!,
);

describe('GlobalThrottlerGuard named-throttler opt-in', () => {
  let guard: GlobalThrottlerGuard;
  let storage: ThrottlerStorageService;

  beforeEach(async () => {
    storage = new ThrottlerStorageService();
    guard = new GlobalThrottlerGuard(
      OPTIONS,
      storage,
      new Reflector(),
      new IpBlockService(new MemoryRateStateStore()),
      { get: () => undefined } as never,
    );
    await guard.onModuleInit();
  });

  it('applies only the default throttler to a route without decorators', async () => {
    const allowed = await guard.canActivate(
      createContext(PlainController.prototype.handler, PlainController),
    );
    expect(allowed).toBe(true);
    expect(storage.storage.size).toBe(1);
  });

  it('applies default + strict when a route opts into strict via @Throttle', async () => {
    const allowed = await guard.canActivate(
      createContext(StrictController.prototype.handler, StrictController),
    );
    expect(allowed).toBe(true);
    expect(storage.storage.size).toBe(2);
  });

  it('honours @SkipThrottle per name alongside an opt-in throttler', async () => {
    const controller = SkippedDefaultWithStrictController;
    const allowed = await guard.canActivate(
      createContext(controller.prototype.handler, controller),
    );
    expect(allowed).toBe(true);
    // default skipped, strict applied
    expect(storage.storage.size).toBe(1);
  });

  it('blocks and throws once the opted-in strict limit is exceeded', async () => {
    const ctx = createContext(
      LowLimitStrictController.prototype.handler,
      LowLimitStrictController,
    );

    await guard.canActivate(ctx);
    await guard.canActivate(ctx);
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('skips non-HTTP (WebSocket) contexts entirely', async () => {
    const allowed = await guard.canActivate(
      createContext(
        PlainController.prototype.handler,
        PlainController,
        '1.2.3.4',
        'ws',
      ),
    );
    expect(allowed).toBe(true);
    // Nothing was recorded — WS traffic must not share an IP bucket.
    expect(storage.storage.size).toBe(0);
  });
});
