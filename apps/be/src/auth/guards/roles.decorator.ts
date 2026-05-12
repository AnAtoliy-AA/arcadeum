import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../lib/roles';
import { ROLES_KEY } from './roles.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
