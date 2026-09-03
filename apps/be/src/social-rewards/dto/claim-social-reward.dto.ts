import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimSocialRewardDto {
  @IsString()
  @IsNotEmpty()
  platform: string;
}
