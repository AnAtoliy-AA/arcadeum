import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
