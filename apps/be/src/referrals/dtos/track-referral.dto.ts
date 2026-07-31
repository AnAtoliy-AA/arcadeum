import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TrackReferralDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  referralCode!: string;
}
