import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class SubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  auth!: string;
}

export class CreateSubscriptionDto {
  @IsString()
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(2048)
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys!: SubscriptionKeysDto;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;
}
