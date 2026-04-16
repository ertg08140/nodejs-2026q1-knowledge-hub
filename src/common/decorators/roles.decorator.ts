import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma/client';

export const ROLES_KEY = 'roles'; // Выносим ключ в константу
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
