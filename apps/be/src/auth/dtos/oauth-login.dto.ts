import { IsIn, IsOptional, IsString } from 'class-validator';

export class OAuthLoginDto {
  @IsString()
  @IsIn(['google'])
  provider!: 'google';

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  idToken?: string;
}
