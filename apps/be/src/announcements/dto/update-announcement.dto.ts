import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_SEVERITIES,
} from '../schemas/announcement.schema';
import type {
  AnnouncementAudience,
  AnnouncementSeverity,
} from '../schemas/announcement.schema';
import { IsAfter } from './validators/is-after.validator';
import { AnnouncementContentDto } from './create-announcement.dto';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsIn(ANNOUNCEMENT_SEVERITIES)
  severity?: AnnouncementSeverity;

  @IsOptional()
  @IsIn(ANNOUNCEMENT_AUDIENCES)
  audience?: AnnouncementAudience;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('startsAt')
  endsAt?: Date | null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AnnouncementContentDto)
  content?: AnnouncementContentDto;
}
