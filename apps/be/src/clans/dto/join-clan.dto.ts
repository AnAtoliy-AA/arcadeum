import { IsMongoId } from 'class-validator';

export class JoinClanDto {
  @IsMongoId()
  clanId!: string;
}
