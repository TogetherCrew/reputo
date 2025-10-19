import type { NotFoundErrorCode } from '../types/errors.js';

export class NotFoundError extends Error {
  public override readonly name = 'NotFoundError';
  public readonly code: NotFoundErrorCode;
  public readonly key: string;
  public readonly version: string | undefined;

  constructor(code: NotFoundErrorCode, key: string, version?: string) {
    const messageMap: Record<NotFoundErrorCode, string> = {
      KEY_NOT_FOUND: 'Algorithm not found',
      VERSION_NOT_FOUND: 'Version not found',
    };

    super(messageMap[code]);

    this.code = code;
    this.key = key;
    this.version = version;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}
