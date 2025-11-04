import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwInvalidIdError(id: string, entity?: string): never {
  const message = entity ? `Invalid ${entity} ID format: ${id}` : `Invalid ID format: ${id}`;
  throw new BadRequestException(message);
}

export function throwNotFoundError(id: string, entity: string): never {
  throw new NotFoundException(`${entity} with ID ${id} not found`);
}
