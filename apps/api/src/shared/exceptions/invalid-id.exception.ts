import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown when an invalid MongoDB ObjectId is provided.
 */
export class InvalidIdException extends BadRequestException {
  constructor(id?: string) {
    const message = id ? `Invalid ID format: ${id}` : 'Invalid ID format';
    super(message);
  }
}
