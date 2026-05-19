import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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
  @IsNotEmpty()
  @MaxLength(1200)
  message!: string;

  // Honeypot — real users submit this empty (it's display:none in the UI);
  // bots that auto-fill every input trip the @MaxLength(0).
  @IsOptional()
  @IsString()
  @MaxLength(0)
  website?: string;
}
