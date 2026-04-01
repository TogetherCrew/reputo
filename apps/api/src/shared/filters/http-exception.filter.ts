import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_FIELD_NAMES = new Set([
  'authorization',
  'authorizationcode',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'token',
  'password',
  'secret',
  'clientsecret',
  'cookie',
  'setcookie',
  'sessionid',
  'xapikey',
  'apikey',
  'code',
  'nonce',
  'state',
  'codeverifier',
]);

function normalizeFieldName(value: string): string {
  return value.replace(/[^a-z0-9]/giu, '').toLowerCase();
}

function isSensitiveFieldName(key: string): boolean {
  return SENSITIVE_FIELD_NAMES.has(normalizeFieldName(key));
}

function sanitizePayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (accumulator, [key, nestedValue]) => {
      accumulator[key] = isSensitiveFieldName(key) ? REDACTED_VALUE : sanitizePayload(nestedValue);
      return accumulator;
    },
    {},
  );
}

export function createHttpErrorResponseBody(path: string, status: number, message: unknown) {
  return {
    statusCode: status,
    timestamp: new Date().toISOString(),
    path,
    message,
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawMessage = exception instanceof HttpException ? exception.getResponse() : 'Internal Server Error';
    const message = sanitizePayload(rawMessage);

    this.logger.error({
      type: exception instanceof HttpException ? exception.name : 'Error',
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
      stack: exception instanceof HttpException ? exception.stack : '',
      status,
      response: message,
      request: {
        method: request.method,
        url: request.url,
        headers: sanitizePayload(request.headers),
        body: sanitizePayload(request.body),
        params: sanitizePayload(request.params),
        query: sanitizePayload(request.query),
      },
    });

    response.status(status).json(createHttpErrorResponseBody(request.url, status, message));
  }
}
