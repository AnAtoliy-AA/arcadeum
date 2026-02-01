import {
  IsString,
  IsNumber,
  IsPositive,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MaxLength(500)
  note!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @MaxLength(8)
  currency!: string;

  @IsString()
  @MaxLength(128)
  transactionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
