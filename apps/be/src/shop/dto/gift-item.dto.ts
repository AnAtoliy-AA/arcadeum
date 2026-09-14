import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

export class GiftItemDto {
  @IsMongoId()
  recipientId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  itemId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  message!: string;
}
