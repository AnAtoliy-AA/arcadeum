import { IsIn } from 'class-validator';
import { USER_ROLES, type UserRole } from '../../auth/lib/roles';

export class UpdateUserRoleDto {
  @IsIn(USER_ROLES)
  role!: UserRole;
}
