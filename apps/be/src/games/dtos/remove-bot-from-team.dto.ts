import { IsString } from 'class-validator';

export class RemoveBotFromTeamDto {
  @IsString()
  roomId!: string;

  @IsString()
  userId!: string;
}
