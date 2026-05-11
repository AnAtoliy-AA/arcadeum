import { IsInt, Max, Min } from 'class-validator';
import { WalletService } from '../../wallet/wallet.service';

export class SetEconomyValueDto {
  @IsInt()
  @Min(1)
  @Max(WalletService.MAX_TRANSACTION_AMOUNT)
  value!: number;
}
