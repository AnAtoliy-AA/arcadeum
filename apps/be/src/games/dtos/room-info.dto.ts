import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RoomInfoDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  roomId!: string;
}
