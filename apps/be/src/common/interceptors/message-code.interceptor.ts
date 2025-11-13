import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { resolveSuccessMessageCode } from '../message-code';

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class MessageCodeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown): unknown => {
        if (!isObjectLike(data)) {
          return data;
        }

        if (typeof data.messageCode === 'number') {
          return data;
        }

        const messageKey = this.extractMessageKey(data);
        const messageCode = resolveSuccessMessageCode(messageKey);

        const enriched: Record<string, unknown> = {
          ...data,
          messageCode,
        };

        if (messageKey && typeof enriched.messageKey !== 'string') {
          enriched.messageKey = messageKey;
        }

        return enriched;
      }),
    );
  }

  private extractMessageKey(body: Record<string, unknown>): string | undefined {
    if (typeof body.messageKey === 'string') {
      return body.messageKey;
    }

    if (typeof body.message === 'string') {
      return body.message;
    }

    return undefined;
  }
}
