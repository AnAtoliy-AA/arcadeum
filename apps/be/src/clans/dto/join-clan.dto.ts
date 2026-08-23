import { IsString, IsNotEmpty } from 'class-validator';

export class JoinClanDto {
  @IsString()
  @IsNotEmpty()
  clanId!: string;
}
