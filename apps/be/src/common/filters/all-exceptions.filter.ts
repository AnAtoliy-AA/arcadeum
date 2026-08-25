import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Raw internal messages (driver errors, CastError, etc.) must never
    // reach clients — return a generic body for 5xx and keep the details in
    // logs only.
    const message =
      httpStatus >= 500
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Request failed';

    const request = ctx.getRequest<Record<string, unknown>>();
    const path =
      typeof httpAdapter.getRequestUrl === 'function'
        ? String(httpAdapter.getRequestUrl(request))
        : '';

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
      message: message,
    };

    // Log the error for debugging, especially important for non-HttpExceptions
    if (httpStatus >= 500) {
      this.logger.error(
        `Unhandled exception: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
