import { IsIn } from 'class-validator';
import { SHOP_CATEGORIES, type ShopCategory } from '../lib/shop-types';

export class UnequipItemDto {
  @IsIn(SHOP_CATEGORIES as readonly string[])
  category!: ShopCategory;
}
