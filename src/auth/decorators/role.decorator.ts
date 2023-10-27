import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES = 'roles';
export const UserRoles = (...userRoles: UserRole[]) =>
  SetMetadata(ROLES, userRoles);
