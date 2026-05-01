import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LeaveGameRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsOptional()
  @IsString()
  kickedBy?: string;
}
