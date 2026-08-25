import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  @Max(10_000)
  amount: number;

  @IsString()
  @MaxLength(8)
  currency: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  description?: string;

  /**
   * @deprecated Ignored server-side — redirect URLs are pinned to
   * PAYPAL_RETURN_URL / PAYPAL_CANCEL_URL. Kept for client compatibility.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  successUrl?: string;

  /** @deprecated Ignored server-side — see successUrl. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  errorUrl?: string;

  /** @deprecated Ignored server-side — see successUrl. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  orderId?: string;
}
