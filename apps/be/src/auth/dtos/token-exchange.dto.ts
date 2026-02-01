import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TokenExchangeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  codeVerifier?: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;
}
