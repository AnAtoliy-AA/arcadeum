import { IsIn, IsOptional } from 'class-validator';

export type AdminUserStatus = 'active' | 'blocked' | 'deleted';

export const ADMIN_USER_STATUSES: AdminUserStatus[] = [
  'active',
  'blocked',
  'deleted',
];

export class AdminUserStatusDto {
  @IsOptional()
  @IsIn(ADMIN_USER_STATUSES)
  status?: AdminUserStatus;
}
