import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsString()
  refreshToken!: string;
}
