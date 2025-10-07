import type { NotFoundErrorCode } from '../types/errors.js';

export class NotFoundError extends Error {
  public override readonly name = 'NotFoundError';
  public readonly code: NotFoundErrorCode;
  public readonly key: string;
  public readonly version: string | undefined;

  constructor(code: NotFoundErrorCode, key: string, version?: string) {
    const message = code === 'KEY_NOT_FOUND' ? 'Algorithm not found' : 'Version not found';
    super(message);

    this.code = code;
    this.key = key;
    this.version = version;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}
