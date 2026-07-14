import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteGameRoomDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid roomId format' })
  roomId: string;
}
