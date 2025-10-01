export type NotFoundCode = 'KEY_NOT_FOUND' | 'VERSION_NOT_FOUND';

export class NotFoundError extends Error {
  override name = 'NotFoundError' as const;
  code: NotFoundCode;
  key: string;
  version: string;

  constructor(opts: {
    message: string;
    code: NotFoundCode;
    key: string;
    version: string;
  }) {
    super(opts.message);
    this.code = opts.code;
    this.key = opts.key;
    this.version = opts.version;
  }
}
