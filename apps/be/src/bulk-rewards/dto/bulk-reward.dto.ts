import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
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
}
