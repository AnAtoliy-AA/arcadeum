import { IsNotEmpty, IsString } from 'class-validator';

export class LeaveGameRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
