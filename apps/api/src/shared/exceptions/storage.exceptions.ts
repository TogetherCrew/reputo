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
