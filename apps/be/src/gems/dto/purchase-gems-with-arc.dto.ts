import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PurchaseGemsWithArcDto {
  @IsNotEmpty()
  @IsString()
  packageId!: string;

  @IsNotEmpty()
  @IsString()
  signature!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'senderAddress must be a valid base58 Solana public key',
  })
  senderAddress!: string;
}
