import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE = 'auth:isPublicRoute';

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE, true);
