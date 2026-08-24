import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EVENT_STATUSES, type EventStatus } from '../schemas/event.schema';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  gameType?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  prizeBadge?: string;

  @IsOptional()
  @IsEnum(EVENT_STATUSES)
  status?: EventStatus;

  @IsOptional()
  @IsNumber()
  activeGamesCount?: number;
}
