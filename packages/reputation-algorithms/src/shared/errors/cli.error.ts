import type { ValidationErrorDetail } from '../types/validation';

abstract class CliError extends Error {
  public readonly filePath: string;
  public readonly key: string | undefined;
  public readonly version: string | undefined;

  constructor(name: string, message: string, filePath: string, key?: string, version?: string) {
    super(message);
    this.name = name;
    this.filePath = filePath;
    this.key = key;
    this.version = version;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, (this as unknown as { constructor: Function }).constructor);
    }
  }
}

export class DuplicateError extends CliError {
  constructor(filePath: string, key: string, version: string) {
    super('DuplicateError', `Duplicate definition for ${key}@${version} at ${filePath}`, filePath, key, version);
  }
}

export class VersionMismatchError extends CliError {
  public readonly filenameVersion: string;
  public readonly contentVersion: string;

  constructor(filePath: string, filenameVersion: string, contentVersion: string, key: string) {
    super(
      'VersionMismatchError',
      `Filename version ${filenameVersion} does not match content version ${contentVersion} at ${filePath}`,
      filePath,
      key,
      contentVersion,
    );
    this.filenameVersion = filenameVersion;
    this.contentVersion = contentVersion;
  }
}

export class KeyMismatchError extends CliError {
  public readonly folderKey: string;
  public readonly contentKey: string;

  constructor(filePath: string, folderKey: string, contentKey: string, version?: string) {
    super(
      'KeyMismatchError',
      `Folder key ${folderKey} does not match content key ${contentKey} at ${filePath}`,
      filePath,
      contentKey,
      version,
    );
    this.folderKey = folderKey;
    this.contentKey = contentKey;
  }
}

export class ValidationError extends CliError {
  public readonly errors: readonly ValidationErrorDetail[];

  constructor(filePath: string, errors: readonly ValidationErrorDetail[], key?: string, version?: string) {
    const errorMessages = errors.map((e) => `  - ${e.instancePath || '/'}: ${e.message || e.keyword}`).join('\n');
    super('ValidationError', `Schema validation failed for ${filePath}:\n${errorMessages}`, filePath, key, version);
    this.errors = errors;
  }
}
