import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma/client';
import { ROLES_KEY } from '../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    console.log('object', context.getHandler(), context.getClass());
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('requiredRoles', requiredRoles);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    console.log('user', user);

    return requiredRoles.some(
      (role) => user.role?.toLowerCase() === role.toLowerCase(),
    );
  }
}
