import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { DeepIdAuthService } from '../../auth/deep-id-auth.service';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly deepIdAuthService: DeepIdAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<'http'>() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    await this.deepIdAuthService.requireSession(http.getRequest<Request>(), http.getResponse<Response>());

    return true;
  }
}
