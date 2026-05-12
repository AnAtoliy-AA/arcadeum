import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
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
import { IsSafeUrl } from './validators/is-safe-url.validator';
import { IsAfter } from './validators/is-after.validator';

export class LocaleContentDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsSafeUrl()
  ctaHref?: string;
}

export class AnnouncementContentDto {
  @ValidateNested()
  @Type(() => LocaleContentDto)
  en!: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  ru?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  es?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  fr?: LocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocaleContentDto)
  by?: LocaleContentDto;
}

export class CreateAnnouncementDto {
  @IsIn(ANNOUNCEMENT_SEVERITIES)
  severity!: AnnouncementSeverity;

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

  @IsObject()
  @ValidateNested()
  @Type(() => AnnouncementContentDto)
  content!: AnnouncementContentDto;
}
