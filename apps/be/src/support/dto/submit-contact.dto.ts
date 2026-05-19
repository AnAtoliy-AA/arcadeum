import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MaxUrls } from '../lib/validators';

export class SubmitContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1200)
  // Cap link-spam — real users rarely paste >2 URLs in a support message.
  @MaxUrls(2)
  message!: string;

  // Client-supplied timestamp (ms since epoch) of when the form mounted.
  // Service rejects submissions that arrive < 2s after this, which catches
  // bots that POST instantly without filling the form. Required so naive
  // bots that omit the field can't bypass the check.
  @IsInt()
  @IsPositive()
  submittedAt!: number;

  // Honeypot — real users submit this empty (it's offscreen in the UI);
  // bots that auto-fill every input trip the @MaxLength(0).
  @IsOptional()
  @IsString()
  @MaxLength(0)
  website?: string;
}
