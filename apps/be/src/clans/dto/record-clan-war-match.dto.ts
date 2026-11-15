import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RecordClanWarMatchDto {
  @IsMongoId()
  @IsNotEmpty()
  winningClanId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  winnerName!: string;

  @IsMongoId()
  @IsNotEmpty()
  loserClanId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  loserName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  gameId?: string;
}
