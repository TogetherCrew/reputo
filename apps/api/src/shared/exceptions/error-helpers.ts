import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Throws a BadRequestException for invalid ID format.
 * @param id - The invalid ID
 * @param entity - Optional entity name for context
 */
export function throwInvalidIdError(id: string, entity?: string): never {
  const message = entity ? `Invalid ${entity} ID format: ${id}` : `Invalid ID format: ${id}`;
  throw new BadRequestException(message);
}

/**
 * Throws a NotFoundException when an entity is not found.
 * @param id - The ID that was not found
 * @param entity - The entity type name
 */
export function throwNotFoundError(id: string, entity: string): never {
  throw new NotFoundException(`${entity} with ID ${id} not found`);
}
