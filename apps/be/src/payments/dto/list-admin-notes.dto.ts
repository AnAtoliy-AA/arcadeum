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

export type AdminNotesVisibility = 'public' | 'private' | 'all';
export const ADMIN_NOTES_VISIBILITY: AdminNotesVisibility[] = [
  'public',
  'private',
  'all',
];

export class ListAdminNotesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 50;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(ADMIN_NOTES_VISIBILITY)
  visibility?: AdminNotesVisibility = 'all';
}
