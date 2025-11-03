import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class StorageConfigurationException extends InternalServerErrorException {
  constructor(message: string) {
    super({
      error: 'Internal Server Error',
      code: 'STORAGE_CONFIGURATION_ERROR',
      message,
    });
  }
}

export class InvalidContentTypeException extends BadRequestException {
  constructor(contentType: string, allowedTypes: string[]) {
    super({
      error: 'Bad Request',
      code: 'INVALID_CONTENT_TYPE',
      message: 'contentType not allowed',
      details: {
        allowed: allowedTypes,
        got: contentType,
      },
    });
  }
}

export class FileTooLargeException extends BadRequestException {
  constructor(maxSizeBytes: number) {
    super({
      error: 'Bad Request',
      code: 'FILE_TOO_LARGE',
      message: 'file too large',
      details: {
        max: maxSizeBytes,
      },
    });
  }
}

export class ObjectNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'Not Found',
      code: 'OBJECT_NOT_FOUND',
      message: 'object not found',
    });
  }
}

export class HeadObjectFailedException extends InternalServerErrorException {
  constructor() {
    super({
      error: 'Internal Server Error',
      code: 'HEAD_FAILED',
      message: 'Failed to check object metadata',
    });
  }
}
