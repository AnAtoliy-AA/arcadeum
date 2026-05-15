import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class PurchaseItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  itemId!: string;

  @IsUUID('4')
  purchaseId!: string;
}
