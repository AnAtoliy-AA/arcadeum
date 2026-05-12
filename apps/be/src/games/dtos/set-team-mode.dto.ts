import { IsBoolean, IsString } from 'class-validator';

export class SetTeamModeDto {
  @IsString()
  roomId!: string;

  @IsBoolean()
  enabled!: boolean;
}
