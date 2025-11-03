import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class StorageConfigurationException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidContentTypeException extends BadRequestException {
  constructor(contentType: string, allowedTypes: string[]) {
    super(`contentType not allowed. Allowed: ${allowedTypes.join(', ')}. Got: ${contentType}`);
  }
}

export class FileTooLargeException extends BadRequestException {
  constructor(maxSizeBytes: number) {
    super(`file too large. Max bytes: ${maxSizeBytes}`);
  }
}

export class ObjectNotFoundException extends NotFoundException {
  constructor() {
    super('object not found');
  }
}

export class HeadObjectFailedException extends InternalServerErrorException {
  constructor() {
    super('Failed to check object metadata');
  }
}
