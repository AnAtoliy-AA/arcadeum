import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

interface ThrottlerInfo {
  limit?: number;
  remaining?: number;
  ttl?: number;
}

@Injectable()
export class RateLimitHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        const throttler = (request as unknown as { throttler?: ThrottlerInfo })
          .throttler;

        if (throttler?.limit != null) {
          response.setHeader('X-RateLimit-Limit', String(throttler.limit));
        }
        if (throttler?.remaining != null) {
          response.setHeader(
            'X-RateLimit-Remaining',
            String(throttler.remaining),
          );
        }
        if (throttler?.ttl != null) {
          response.setHeader(
            'X-RateLimit-Reset',
            String(Math.ceil(throttler.ttl / 1000)),
          );
        }
      }),
    );
  }
}
