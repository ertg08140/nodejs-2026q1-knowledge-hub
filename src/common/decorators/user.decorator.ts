import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'generated/prisma/client';

export interface UserPayload {
  userId: string;
  login: string;
  role: UserRole;
}

export const GetUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    return data ? user?.[data] : user;
  },
);
