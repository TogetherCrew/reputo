import { BadRequestException } from '@nestjs/common';

export class InvalidIdException extends BadRequestException {
  constructor(id?: string) {
    const message = id ? `Invalid ID format: ${id}` : 'Invalid ID format';
    super(message);
  }
}
