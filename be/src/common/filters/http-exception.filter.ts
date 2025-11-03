import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { resolveErrorMessageCode } from '../message-code';

interface ExceptionResponseShape {
  statusCode?: number;
  message?: unknown;
  error?: string;
  messageCode?: number;
  [key: string]: unknown;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | ExceptionResponseShape
      | string;

    const {
      message,
      messageCode: predefinedCode,
      error,
      details,
    } = this.extractResponseDetails(exceptionResponse);

    const messageCode =
      typeof predefinedCode === 'number'
        ? predefinedCode
        : resolveErrorMessageCode(message);

    const body = {
      statusCode: status,
      message: message ?? exception.message,
      messageKey: typeof message === 'string' ? message : undefined,
      messageCode,
      error: error ?? exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details ? { details } : {}),
    };

    response.status(status).json(body);
  }

  private extractResponseDetails(response: ExceptionResponseShape | string) {
    if (typeof response === 'string') {
      return {
        message: response,
        error: undefined,
        details: undefined,
        messageCode: undefined,
      };
    }

    const normalizedMessage = this.normalizeMessage(response.message);
    const remainingDetails = this.stripKnownKeys(response);

    return {
      message: normalizedMessage,
      messageCode:
        typeof response.messageCode === 'number'
          ? response.messageCode
          : undefined,
      error: typeof response.error === 'string' ? response.error : undefined,
      details: remainingDetails,
    };
  }

  private normalizeMessage(message: unknown): string | undefined {
    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      const first = message.find((item) => typeof item === 'string');
      return typeof first === 'string' ? first : undefined;
    }

    return undefined;
  }

  private stripKnownKeys(
    response: ExceptionResponseShape,
  ): Record<string, unknown> | undefined {
    const clone: Record<string, unknown> = { ...response };
    delete clone.statusCode;
    delete clone.message;
    delete clone.error;
    delete clone.messageCode;

    return Object.keys(clone).length > 0 ? clone : undefined;
  }
}
