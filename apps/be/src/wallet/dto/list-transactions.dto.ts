import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  WALLET_CURRENCIES,
  type WalletCurrency,
} from '../interfaces/wallet-types';

export class ListTransactionsDto {
  @IsOptional()
  @IsIn(WALLET_CURRENCIES as readonly string[])
  currency?: WalletCurrency;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
