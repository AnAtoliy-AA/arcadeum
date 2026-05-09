import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ANNOUNCEMENT_SEVERITIES,
  type AnnouncementSeverity,
} from '../schemas/announcement.schema';

export const ADMIN_ANNOUNCEMENTS_STATUS = [
  'all',
  'active',
  'scheduled',
  'expired',
] as const;
export type AdminAnnouncementsStatus =
  (typeof ADMIN_ANNOUNCEMENTS_STATUS)[number];

export class ListAdminAnnouncementsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(ADMIN_ANNOUNCEMENTS_STATUS)
  status?: AdminAnnouncementsStatus = 'all';

  @IsOptional()
  @IsIn(ANNOUNCEMENT_SEVERITIES)
  severity?: AnnouncementSeverity;
}
