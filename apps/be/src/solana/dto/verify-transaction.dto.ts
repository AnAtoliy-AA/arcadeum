import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class VerifyTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  signature!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  senderAddress!: string;
}
