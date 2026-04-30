import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const NAME_IDENTIFIER = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'];
    return Number(user[NAME_IDENTIFIER] ?? user.sub);
  },
);
