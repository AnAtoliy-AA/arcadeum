import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class InvitePlayersDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  userIds!: string[];
}
