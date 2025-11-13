import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @MaxLength(8)
  currency: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  successUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  errorUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  orderId?: string;
}
