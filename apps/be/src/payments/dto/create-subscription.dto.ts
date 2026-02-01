import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export enum SubscriptionInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateSubscriptionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @MaxLength(8)
  currency: string;

  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  cancelUrl?: string;
}
