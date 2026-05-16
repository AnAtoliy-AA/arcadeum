import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import {
  WALLET_CURRENCIES,
  type WalletCurrency,
} from '../interfaces/wallet-types';

export class DeductWalletDto {
  @IsIn(WALLET_CURRENCIES as readonly string[])
  currency!: WalletCurrency;

  @IsInt()
  @IsPositive()
  @Max(1_000_000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
