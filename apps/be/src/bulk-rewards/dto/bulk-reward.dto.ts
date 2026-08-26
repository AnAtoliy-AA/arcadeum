import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum BulkRewardType {
  COINS = 'coins',
  GEMS = 'gems',
  ARCADEUM = 'arcadeum',
  ITEM = 'item',
}

export class BulkRewardDto {
  @IsEnum(BulkRewardType)
  @IsNotEmpty()
  type!: BulkRewardType;

  @IsInt()
  @Min(1)
  @Max(1_000_000)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  itemId?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  /**
   * Stable identifier for this bulk operation. Supply the SAME value when
   * retrying a partially-failed run so already-rewarded users are not paid
   * twice. Generated per invocation when omitted.
   */
  @IsString()
  @IsOptional()
  @MaxLength(64)
  operationId?: string;
}
