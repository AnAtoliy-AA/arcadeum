import { IsIn, IsOptional, IsString } from 'class-validator';

export type OAuthProvider = 'google' | 'apple' | 'discord';

export class OAuthLoginDto {
  @IsString()
  @IsIn(['google', 'apple', 'discord'])
  provider!: OAuthProvider;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  authorizationCode?: string;
}
