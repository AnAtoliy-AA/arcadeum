import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteGameRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
