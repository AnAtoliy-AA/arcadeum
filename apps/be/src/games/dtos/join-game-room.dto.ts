import { IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';

export class JoinGameRoomDto {
  @ValidateIf(({ inviteCode }) => !inviteCode)
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  roomId?: string;

  @ValidateIf(({ roomId }) => !roomId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  inviteCode?: string;
}
