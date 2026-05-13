import {
  IsMongoId,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GrantItemDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  itemId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  reason!: string;

  @IsUUID('4')
  nonce!: string;
}
