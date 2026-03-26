import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class FileTooLargeException extends BadRequestException {
  constructor(maxSizeBytes: number) {
    const message = `File too large. Maximum size allowed: ${maxSizeBytes} bytes`;
    super(message);
  }
}

export class InvalidContentTypeException extends BadRequestException {
  constructor(contentType: string, allowedTypes: readonly string[]) {
    const message = `ContentType not allowed: ${contentType}. Allowed types: ${allowedTypes.join(', ')}`;
    super(message);
  }
}

export class ObjectNotFoundException extends NotFoundException {
  constructor() {
    super('Object not found');
  }
}

export class HeadObjectFailedException extends InternalServerErrorException {
  constructor() {
    super('Failed to check object metadata');
  }
}

/**
 * Structured error for a specific storage input validation failure.
 */
export interface StorageInputValidationError {
  /** The input key from the algorithm definition */
  inputKey: string;
  /** Array of error messages for this input */
  errors: string[];
}

/**
 * Exception thrown when storage-backed algorithm input validation fails.
 * Collects all validation errors across metadata and content validation.
 */
export class StorageInputValidationException extends BadRequestException {
  constructor(errors: StorageInputValidationError[]) {
    super({
      message: 'Storage input validation failed',
      errors,
    });
  }
}

/** @deprecated Use StorageInputValidationException instead. */
export class CSVValidationException extends StorageInputValidationException {}
