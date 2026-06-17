import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsString()
  walletAddress!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  amount!: number;
}
