import { IsUUID } from 'class-validator';

export class SellItemDto {
  @IsUUID('4')
  purchaseId!: string;
}
