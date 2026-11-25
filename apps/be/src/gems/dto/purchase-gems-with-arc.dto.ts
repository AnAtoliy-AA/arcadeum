import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class PurchaseGemsWithArcDto {
  @IsNotEmpty()
  @IsString()
  packageId!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{64,100}$/, {
    message: 'signature must be a base58 Solana transaction signature',
  })
  signature!: string;

  /** Optional: omitted for Solana Pay (the session reference binds the user). */
  @IsOptional()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'senderAddress must be a valid base58 Solana public key',
  })
  senderAddress?: string;
}
