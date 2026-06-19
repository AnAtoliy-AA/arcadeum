import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'walletAddress must be a valid base58 Solana public key',
  })
  walletAddress!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  amount!: number;
}
