import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LeaveGameRoomDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid roomId format' })
  roomId: string;

  @IsOptional()
  @IsString()
  @IsMongoId({ message: 'Invalid userId format' })
  kickedBy?: string;
}
