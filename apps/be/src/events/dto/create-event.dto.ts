import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { EVENT_STATUSES, type EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  gameType!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  prizeBadge?: string;

  @IsOptional()
  @IsEnum(EVENT_STATUSES)
  status?: EventStatus;
}
