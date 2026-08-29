import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RecordEngagementEventDto {
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsOptional()
  targetUserId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
