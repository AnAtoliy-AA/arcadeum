import { IsString } from 'class-validator';

export class AddBotToTeamDto {
  @IsString()
  roomId!: string;

  @IsString()
  teamId!: string;
}
