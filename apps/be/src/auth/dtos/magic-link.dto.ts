import { IsEmail, IsString } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token!: string;
}
