import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

/**
 * Pipe that validates MongoDB ObjectId format.
 * Throws BadRequestException if the ID is invalid.
 *
 * @example
 * ```typescript
 * @Get(':id')
 * findById(@Param('id', ParseObjectIdPipe) id: string) {
 *   // id is guaranteed to be a valid ObjectId format
 * }
 * ```
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isValidObjectId(value)) {
      const paramName = metadata.data || 'id';
      throw new BadRequestException(`Invalid ${paramName} format. Expected a valid MongoDB ObjectId.`);
    }
    return value;
  }
}
