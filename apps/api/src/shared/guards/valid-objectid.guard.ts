import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

/**
 * Guard that validates MongoDB ObjectId format in route parameters.
 * Checks the 'id' parameter by default, but can be configured for other parameters.
 *
 * @example
 * ```typescript
 * @UseGuards(ValidObjectIdGuard)
 * @Get(':id')
 * findById(@Param('id') id: string) {
 *   // id is guaranteed to be a valid ObjectId format
 * }
 * ```
 */
@Injectable()
export class ValidObjectIdGuard implements CanActivate {
  constructor(private readonly paramName: string = 'id') {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const paramValue = request.params[this.paramName];

    if (!paramValue) {
      throw new BadRequestException(`Missing parameter: ${this.paramName}`);
    }

    if (!isValidObjectId(paramValue)) {
      throw new BadRequestException(`Invalid ${this.paramName} format. Expected a valid MongoDB ObjectId.`);
    }

    return true;
  }
}
