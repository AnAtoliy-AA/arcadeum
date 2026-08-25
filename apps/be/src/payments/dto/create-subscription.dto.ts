import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export enum SubscriptionInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateSubscriptionDto {
  @IsNumber()
  @IsPositive()
  @Max(10_000)
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

  /** @deprecated Ignored server-side — redirect URLs are pinned to env. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnUrl?: string;

  /** @deprecated Ignored server-side — see returnUrl. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  cancelUrl?: string;
}
