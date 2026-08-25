import { IsNotEmpty, IsString } from 'class-validator';

export class RequestHintDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
