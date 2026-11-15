import { IsBoolean, IsNotEmpty } from 'class-validator';

export class RespondClanWarDto {
  @IsBoolean()
  @IsNotEmpty()
  accept!: boolean;
}
