import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  SHOP_PRICE_CURRENCIES,
  type ShopPriceCurrency,
} from '../lib/shop-types';

export class SetItemOverrideDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsBoolean()
  available?: boolean | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  priceAmount?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsIn(SHOP_PRICE_CURRENCIES as readonly string[])
  priceCurrency?: ShopPriceCurrency | null;
}
