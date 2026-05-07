import { IsBoolean, IsString } from 'class-validator';

export class ToggleHideShipsDto {
  @IsString()
  roomId!: string;

  @IsBoolean()
  enabled!: boolean;
}
